from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, Field, HttpUrl, model_validator
import json
import torch
from app.database import get_db
from app.models.participant import Participant
from app.models.block import Block
from app.models.verification import VerificationRecord
from app.schemas.verification import VerificationCreate, VerificationResponse, MatchedBlock
from app.deps import get_current_user
from app.services.ai_verification import verify_text_locally
from app.services.image_features import extract_image_features

router = APIRouter(prefix="/verify", tags=["verification"])


class VerificationCreateBody(BaseModel):
    participant_id: Optional[str] = Field(default=None, min_length=1, max_length=36)
    block_id: Optional[str] = Field(default=None, min_length=1, max_length=36)
    input_text: Optional[str] = Field(None, min_length=1, max_length=65535)
    image_url: Optional[HttpUrl] = None

    @model_validator(mode='after')
    def check_input(self):
        if not self.input_text and not self.image_url:
            raise ValueError('Either input_text or image_url must be provided')
        return self


def _cosine_similarity(a: list, b: list) -> float:
    ta = torch.tensor(a, dtype=torch.float32)
    tb = torch.tensor(b, dtype=torch.float32)
    return float(torch.nn.functional.cosine_similarity(ta, tb, dim=0).item())


@router.post("/", response_model=VerificationResponse)
async def verify_input(
    payload: VerificationCreateBody,
    db: AsyncSession = Depends(get_db),
    current_user: Participant = Depends(get_current_user),
):
    if current_user.role != "admin":
        if payload.participant_id and payload.participant_id != current_user.id:
            raise HTTPException(status_code=403, detail="Cannot verify block of another participant")
        payload.participant_id = current_user.id
    matched_blocks = []
    best_label = "Unrelated"
    best_score = 0.0
    result_text = ""
    is_image = bool(payload.image_url)

    if payload.block_id:
        result = await db.execute(select(Block).where(Block.id == payload.block_id))
        entry = result.scalar_one_or_none()
        if not entry:
            raise HTTPException(status_code=404, detail="Block not found")
        matched_blocks.append(_entry_to_matched(entry))
    elif payload.participant_id:
        query = select(Block).where(Block.participant_id == payload.participant_id)
        if is_image:
            query = query.where(Block.image_url.isnot(None), Block.image_features.isnot(None))
        else:
            query = query.where(Block.image_url.is_(None), Block.image_features.is_(None))
        result = await db.execute(query.order_by(Block.created_at.desc()).limit(5))
        entries = result.scalars().all()
        if not entries:
            raise HTTPException(status_code=404, detail="No blockchain blocks found for this participant")
        for e in entries:
            matched_blocks.append(_entry_to_matched(e))
    else:
        query = select(Block).where(Block.transaction_data.isnot(None), Block.transaction_data != "")
        if is_image:
            query = query.where(Block.image_url.isnot(None), Block.image_features.isnot(None))
        else:
            query = query.where(Block.image_url.is_(None), Block.image_features.is_(None))
        result = await db.execute(query.order_by(Block.created_at.desc()).limit(20))
        for e in result.scalars().all():
            matched_blocks.append(_entry_to_matched(e))

    if is_image:
        input_features = await extract_image_features(str(payload.image_url))
        if input_features is None:
            raise HTTPException(status_code=400, detail="Failed to extract features from input image URL")

        scored = []
        for me in matched_blocks:
            if me.image_features:
                score = _cosine_similarity(input_features, me.image_features)
                scored.append((score, me))
        if not scored and not payload.block_id and not payload.participant_id:
            all_result = await db.execute(
                select(Block)
                .where(Block.image_url.isnot(None), Block.image_features.isnot(None))
                .limit(20)
            )
            for e in all_result.scalars().all():
                me = _entry_to_matched(e)
                if me.image_features:
                    score = _cosine_similarity(input_features, me.image_features)
                    scored.append((score, me))

        scored.sort(key=lambda x: x[0], reverse=True)
        best_score, best_me = scored[0] if scored else (0.0, None)
        if best_score >= 0.85:
            best_label = "Exact Match"
        elif best_score >= 0.65:
            best_label = "Partial Match"
        elif best_score >= 0.40:
            best_label = "Mismatch"
        else:
            best_label = "Unrelated"

        if best_me:
            tx_type = best_me.transaction_type.replace("_", " ").title()
            confidence_pct = best_score * 100
            if best_label == "Exact Match":
                result_text = (
                    f"The submitted image has been verified as an exact match against the blockchain {tx_type} "
                    f"(ID: {best_me.id}). The visual features align perfectly with the stored record. "
                    f"This verification was performed with a confidence score of {confidence_pct:.2f}%, confirming that the "
                    f"submitted image is authentic and corresponds to the original blockchain version. "
                    f"The block's integrity is further ensured by its immutable blockchain record (hash: {best_me.block_hash}). "
                    f"Verification status: completed."
                )
            elif best_label == "Partial Match":
                result_text = (
                    f"The submitted image has been verified as a partial match against the blockchain {tx_type} "
                    f"(ID: {best_me.id}). While the submitted image shares visual similarities with the stored record, "
                    f"there are notable differences that prevent it from being considered an exact match. "
                    f"The verification confidence score is {confidence_pct:.2f}%. "
                    f"The blockchain block hash is {best_me.block_hash}. Verification status: completed."
                )
            elif best_label == "Mismatch":
                result_text = (
                    f"The submitted image has been verified as a mismatch against the blockchain {tx_type} "
                    f"(ID: {best_me.id}). The visual content contradicts the stored record. "
                    f"The verification confidence score is {confidence_pct:.2f}%, indicating significant discrepancies. "
                    f"This raises concerns about the authenticity or integrity of the submitted image. "
                    f"The original blockchain block hash is {best_me.block_hash}. Verification status: completed."
                )
            elif best_label == "Fabricated":
                result_text = (
                    f"The submitted image has been flagged as potentially fabricated or false when compared against the blockchain {tx_type} "
                    f"(ID: {best_me.id}). The visual content appears to conflict with the verified blockchain record. "
                    f"The verification confidence score is {confidence_pct:.2f}%. "
                    f"This suggests that the submitted image may be forged, altered, or intentionally misleading. "
                    f"The verified blockchain block hash is {best_me.block_hash}. Verification status: completed."
                )
            else:
                result_text = (
                    f"The submitted image has been verified as unrelated to the blockchain {tx_type} "
                    f"(ID: {best_me.id}). The visual content does not correspond to the stored record. "
                    f"The verification confidence score is {confidence_pct:.2f}%, indicating no meaningful similarity. "
                    f"This may indicate that the submitted image belongs to a different context or purpose. "
                    f"The blockchain block hash is {best_me.block_hash}. Verification status: completed."
                )
        else:
            result_text = (
                "No matching blockchain entries were found for the provided image. "
                "The submitted image could not be verified against any blockchain blocks in the system. "
                "Please ensure that the image has been previously blockchain or provide valid identification criteria."
            )
        matched_blocks = [best_me] if best_me else []
    else:
        tx_contents = [
            me.transaction_data_preview or ""
            for me in matched_blocks
            if me.transaction_data_preview and not (me.image_url and (me.transaction_data_preview == me.image_url or me.transaction_data_preview.startswith("http")))
        ]
        for tx_content in tx_contents:
            label, score = await verify_text_locally(
                payload.input_text or "",
                reference_text=tx_content,
                threshold=0.0,
            )
            if score > best_score:
                best_score = score
                best_label = label

        if best_score < 0.60:
            best_label = "Uncertain"

        is_exact_match = best_label == "Exact Match" and best_score >= 0.99

        if matched_blocks:
            entry = matched_blocks[0]
            tx_type = entry.transaction_type.replace("_", " ").title()
            data_preview = entry.transaction_data_preview or ""
            confidence_pct = best_score * 100

            if best_label == "Exact Match":
                result_text = (
                    f"The submitted document has been verified as an exact match against the blockchain {tx_type} "
                    f"(ID: {entry.id}). The content aligns perfectly with the stored record, which includes details such as "
                    f"{data_preview.lower()}. "
                    f"This verification was performed with a confidence score of {confidence_pct:.2f}%, confirming that the "
                    f"submitted document is authentic and unchanged from the original blockchain version. "
                    f"The block's integrity is further ensured by its immutable blockchain record (hash: {entry.block_hash}). "
                    f"Verification status: completed."
                )
            elif best_label == "Partial Match":
                result_text = (
                    f"The submitted document has been verified as a partial match against the blockchain {tx_type} "
                    f"(ID: {entry.id}). While the submitted content shares similarities with the stored record "
                    f"({data_preview.lower()}), there are notable differences that prevent it from being considered an exact match. "
                    f"The verification confidence score is {confidence_pct:.2f}%. "
                    f"This indicates that the document may be a revised version, a duplicate with modifications, or a related but distinct block. "
                    f"The blockchain block hash is {entry.block_hash}. Verification status: completed."
                )
            elif best_label == "Mismatch":
                result_text = (
                    f"The submitted document has been verified as a mismatch against the blockchain {tx_type} "
                    f"(ID: {entry.id}). The submitted content contradicts the stored record "
                    f"({data_preview.lower()}). "
                    f"The verification confidence score is {confidence_pct:.2f}%, indicating significant discrepancies between the submitted document and the blockchain version. "
                    f"This raises concerns about the authenticity or integrity of the submitted document. "
                    f"The original blockchain block hash is {entry.block_hash}. Verification status: completed."
                )
            elif best_label == "Fabricated":
                result_text = (
                    f"The submitted document has been flagged as potentially fabricated or false when compared against the blockchain {tx_type} "
                    f"(ID: {entry.id}). The content appears to contain information that conflicts with the verified blockchain record "
                    f"({data_preview.lower()}). "
                    f"The verification confidence score is {confidence_pct:.2f}%. "
                    f"This suggests that the submitted document may be forged, altered, or intentionally misleading. "
                    f"The verified blockchain block hash is {entry.block_hash}. Verification status: completed."
                )
            elif best_label == "Unrelated":
                result_text = (
                    f"The submitted document has been verified as unrelated to the blockchain {tx_type} "
                    f"(ID: {entry.id}). The submitted content does not correspond to the stored record "
                    f"({data_preview.lower()}). "
                    f"The verification confidence score is {confidence_pct:.2f}%, indicating no meaningful similarity between the submitted document and the blockchain version. "
                    f"This may indicate that the submitted document belongs to a different context, participant, or purpose. "
                    f"The blockchain block hash is {entry.block_hash}. Verification status: completed."
                )
            else:
                result_text = (
                    f"The submitted document could not be confidently verified against the blockchain {tx_type} "
                    f"(ID: {entry.id}). The verification confidence score is {confidence_pct:.2f}%, which is below the required threshold for a definitive match. "
                    f"The submitted content shows some similarity to the stored record ({data_preview.lower()}), but the evidence is insufficient for a conclusive determination. "
                    f"Further manual review or additional documentation may be required. The blockchain block hash is {entry.block_hash}. Verification status: completed."
                )
        else:
            result_text = (
                "No matching blockchain entries were found for the provided criteria. "
                "The submitted document could not be verified against any blockchain blocks in the system. "
                "Please ensure that the document has been previously blockchain or provide valid identification criteria."
            )

    record = VerificationRecord(
        participant_id=payload.participant_id,
        block_id=payload.block_id,
        input_text=payload.input_text or "",
        input_image_url=str(payload.image_url) if payload.image_url else None,
        ai_model_id="dinov2-small" if is_image else "local",
        prediction_label=best_label,
        prediction_score=best_score,
        status="completed",
    )
    db.add(record)
    await db.flush()

    return {
        "id": str(record.id),
        "participant_id": payload.participant_id,
        "block_id": payload.block_id,
        "input_text": record.input_text,
        "input_image_url": record.input_image_url,
        "ai_model_id": record.ai_model_id,
        "prediction_label": record.prediction_label,
        "prediction_score": record.prediction_score,
        "status": record.status,
        "is_exact_match": is_image and best_label == "Exact Match" and best_score >= 0.99,
        "matched_blocks": matched_blocks,
        "result_text": result_text,
        "created_at": record.created_at,
    }


def _entry_to_matched(entry: Block) -> MatchedBlock:
    image_features = None
    if entry.image_features:
        try:
            image_features = json.loads(entry.image_features)
        except Exception:
            image_features = None
    return MatchedBlock(
        id=str(entry.id),
        transaction_type=entry.transaction_type,
        transaction_data_preview=entry.transaction_data[:500] if entry.transaction_data else None,
        block_hash=entry.block_hash,
        created_at=entry.created_at,
        image_url=entry.image_url,
        image_features=image_features,
    )
