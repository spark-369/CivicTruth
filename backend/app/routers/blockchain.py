from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete as sq_delete
from sqlalchemy.orm import selectinload
from pydantic import BaseModel, Field, HttpUrl, model_validator
import json
from app.database import get_db
from app.models.participant import Participant
from app.models.block import Block
from app.schemas.block import BlockCreate, BlockUpdate, BlockResponse
from app.services.tamper_proof import append_to_chain, verify_chain, compute_data_hash, compute_block_hash
from app.services.ai_verification import verify_text_locally
from app.services.image_features import extract_image_features
from app.deps import get_current_user, require_role
from app.utils.time import utcnow_naive
from typing import Optional

router = APIRouter(prefix="/blockchain", tags=["blockchain"])


class BlockCreateBody(BaseModel):
    participant_id: str = Field(min_length=1, max_length=36)
    transaction_type: str = Field(min_length=1, max_length=64)
    transaction_data: Optional[str] = Field(None, min_length=1, max_length=65535)
    image_url: Optional[HttpUrl] = None

    @model_validator(mode='after')
    def check_data_or_image(self):
        if not self.transaction_data and not self.image_url:
            raise ValueError('Either transaction_data or image_url must be provided')
        return self


class BlockUpdateBody(BaseModel):
    transaction_type: Optional[str] = Field(None, min_length=1, max_length=64)
    transaction_data: Optional[str] = Field(None, min_length=0, max_length=65535)
    image_url: Optional[str] = None


def _block_response_from_entry(entry: Block) -> dict:
    image_features = None
    if entry.image_features:
        try:
            image_features = json.loads(entry.image_features)
        except Exception:
            image_features = None
    return {
        "id": str(entry.id),
        "participant_id": str(entry.participant_id),
        "participant_name": entry.participant.full_name if entry.participant else None,
        "transaction_type": entry.transaction_type,
        "transaction_data": entry.transaction_data,
        "data_hash": entry.data_hash,
        "block_hash": entry.block_hash,
        "ai_verification_score": entry.ai_verification_score,
        "ai_verification_label": entry.ai_verification_label,
        "image_url": entry.image_url,
        "image_features": image_features,
        "created_at": entry.created_at,
    }


@router.post("/", response_model=BlockResponse)
async def create_block(
    payload: BlockCreateBody,
    db: AsyncSession = Depends(get_db),
    current_user: Participant = Depends(get_current_user),
):
    if payload.participant_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Cannot create block for another participant")
    participant = (await db.execute(select(Participant).where(Participant.id == payload.participant_id))).scalar_one_or_none()
    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")
    tx_data = payload.transaction_data or ""
    entry = Block(
        participant_id=payload.participant_id,
        transaction_type=payload.transaction_type,
        transaction_data=tx_data,
        image_url=str(payload.image_url) if payload.image_url else None,
        created_at=utcnow_naive(),
    )
    entry = await append_to_chain(entry, db=db)
    if tx_data:
        label, score = await verify_text_locally(tx_data)
        entry.ai_verification_label = label
        entry.ai_verification_score = f"{score:.4f}"
    if entry.image_url:
        features = await extract_image_features(entry.image_url)
        if features is not None:
            entry.image_features = json.dumps(features)
    await db.flush()
    entry.participant = participant
    return _block_response_from_entry(entry)


@router.get("/", response_model=list[BlockResponse])
async def list_blocks(
    db: AsyncSession = Depends(get_db),
    current_user: Participant = Depends(get_current_user),
):
    query = select(Block).options(selectinload(Block.participant)).order_by(Block.created_at.desc())
    if current_user.role != "admin":
        query = query.where(Block.participant_id == current_user.id)
    result = await db.execute(query)
    entries = result.scalars().all()
    return [_block_response_from_entry(e) for e in entries]


@router.get("/chain/verify", response_model=dict)
async def verify_chain_endpoint(
    current_user: Participant = Depends(get_current_user),
):
    return await verify_chain()


@router.get("/{entry_id}", response_model=BlockResponse)
async def get_block(
    entry_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Participant = Depends(get_current_user),
):
    entry = (await db.execute(select(Block).options(selectinload(Block.participant)).where(Block.id == entry_id))).scalar_one_or_none()
    if not entry:
        raise HTTPException(status_code=404, detail="Block not found")
    if entry.participant_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Cannot view block of another participant")
    return _block_response_from_entry(entry)


@router.put("/{entry_id}", response_model=BlockResponse)
async def update_block(
    entry_id: str,
    payload: BlockUpdateBody,
    db: AsyncSession = Depends(get_db),
    current_user: Participant = Depends(require_role("admin")),
):
    entry = (await db.execute(select(Block).options(selectinload(Block.participant)).where(Block.id == entry_id))).scalar_one_or_none()
    if not entry:
        raise HTTPException(status_code=404, detail="Block not found")

    update_data = payload.model_dump(exclude_unset=True)
    data_changed = False
    if "transaction_type" in update_data:
        entry.transaction_type = update_data["transaction_type"]
    if "transaction_data" in update_data:
        entry.transaction_data = update_data["transaction_data"] or ""
        data_changed = True
    if "image_url" in update_data:
        entry.image_url = str(update_data["image_url"]) if update_data["image_url"] else None
        data_changed = True
        if entry.image_url:
            features = await extract_image_features(entry.image_url)
            entry.image_features = json.dumps(features) if features is not None else None
        else:
            entry.image_features = None

    if entry.transaction_data:
        label, score = await verify_text_locally(entry.transaction_data)
        entry.ai_verification_label = label
        entry.ai_verification_score = f"{score:.4f}"
    else:
        entry.ai_verification_label = None
        entry.ai_verification_score = None

    if data_changed:
        entry.data_hash = compute_data_hash(entry.transaction_data, entry.image_url)
        entry.block_hash = compute_block_hash(entry.data_hash, entry.parent_hash, entry.created_at)
        result = await db.execute(
            select(Block)
            .where(Block.created_at > entry.created_at)
            .order_by(Block.created_at.asc(), Block.id.asc())
        )
        subsequent = result.scalars().all()
        expected_prev = entry.block_hash
        for sub in subsequent:
            sub.data_hash = compute_data_hash(sub.transaction_data, sub.image_url)
            sub.block_hash = compute_block_hash(sub.data_hash, expected_prev, sub.created_at)
            expected_prev = sub.block_hash
            db.add(sub)

    await db.flush()
    return _block_response_from_entry(entry)


@router.delete("/{entry_id}", response_model=dict)
async def delete_block(
    entry_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Participant = Depends(get_current_user),
):
    entry = (await db.execute(select(Block).where(Block.id == entry_id))).scalar_one_or_none()
    if not entry:
        raise HTTPException(status_code=404, detail="Block not found")
    if entry.participant_id != current_user.id and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Cannot delete block of another participant")

    result = await db.execute(
        select(Block)
        .where(Block.created_at > entry.created_at)
        .order_by(Block.created_at.asc(), Block.id.asc())
    )
    subsequent = result.scalars().all()
    prev_hash = entry.parent_hash

    await db.execute(sq_delete(Block).where(Block.id == entry_id))

    expected_prev = prev_hash
    for sub in subsequent:
        sub.parent_hash = expected_prev
        sub.data_hash = compute_data_hash(sub.transaction_data, sub.image_url)
        sub.block_hash = compute_block_hash(sub.data_hash, expected_prev, sub.created_at)
        expected_prev = sub.block_hash
        db.add(sub)

    return {"message": "Block deleted", "id": entry_id}