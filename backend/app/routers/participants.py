from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete as sq_delete
from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from app.database import get_db
from app.models.participant import Participant
from app.schemas.participant import ParticipantResponse, ParticipantUpdate
from app.deps import get_current_user, require_role
from app.utils.security import hash_password
from app.utils.time import parse_iso_date

router = APIRouter(prefix="/participants", tags=["participants"])


class ParticipantCreateBody(BaseModel):
    full_name: str = Field(min_length=1, max_length=256)
    national_id: str = Field(min_length=1, max_length=128)
    password: str = Field(min_length=8, max_length=128)
    email: Optional[EmailStr] = None
    dob: Optional[str] = Field(None, max_length=64)
    bio: Optional[str] = Field(None, max_length=1024)


@router.get("/", response_model=list[ParticipantResponse])
async def list_participants(
    db: AsyncSession = Depends(get_db),
    current_user: Participant = Depends(get_current_user),
    limit: int = Query(10, ge=1, le=100),
    offset: int = Query(0, ge=0),
):
    result = await db.execute(select(Participant).limit(limit).offset(offset))
    participants = result.scalars().all()
    return [ParticipantResponse.model_validate(p) for p in participants]


@router.get("/{participant_id}", response_model=ParticipantResponse)
async def get_participant(
    participant_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Participant = Depends(get_current_user),
):
    result = await db.execute(select(Participant).where(Participant.id == participant_id))
    participant = result.scalar_one_or_none()
    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")
    return ParticipantResponse.model_validate(participant)


@router.post("/", response_model=ParticipantResponse)
async def create_participant(
    payload: ParticipantCreateBody,
    db: AsyncSession = Depends(get_db),
    current_user: Participant = Depends(require_role("admin")),
):
    from app.routers.auth import _mask_national_id
    from app.utils.security import hash_identifier, create_access_token
    nid_hash = hash_identifier(payload.national_id)
    existing = (await db.execute(select(Participant).where(Participant.national_id_hash == nid_hash))).scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Participant already registered")
    participant = Participant(
        full_name=payload.full_name,
        national_id_hash=nid_hash,
        password_hash=hash_password(payload.password),
    )
    if payload.email:
        participant.email = payload.email
    if payload.dob:
        try:
            participant.dob = parse_iso_date(payload.dob)
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid dob: expected an ISO date (YYYY-MM-DD)")
    if payload.bio:
        participant.bio = payload.bio
    db.add(participant)
    await db.flush()
    await db.refresh(participant)
    return ParticipantResponse.model_validate(participant)


@router.put("/{participant_id}", response_model=ParticipantResponse)
async def update_participant(
    participant_id: str,
    payload: ParticipantUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: Participant = Depends(require_role("admin")),
):
    result = await db.execute(select(Participant).where(Participant.id == participant_id))
    participant = result.scalar_one_or_none()
    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")

    update_data = payload.model_dump(exclude_unset=True)
    if "full_name" in update_data:
        participant.full_name = update_data["full_name"]
    if "dob" in update_data:
        if update_data["dob"]:
            try:
                participant.dob = parse_iso_date(update_data["dob"])
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid dob: expected an ISO date (YYYY-MM-DD)")
        else:
            participant.dob = None
    if "bio" in update_data:
        participant.bio = update_data["bio"]
    if "email" in update_data:
        participant.email = update_data["email"]
    if "is_active" in update_data:
        participant.is_active = update_data["is_active"]

    await db.flush()
    await db.refresh(participant)
    return ParticipantResponse.model_validate(participant)


@router.delete("/{participant_id}", response_model=dict)
async def delete_participant(
    participant_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: Participant = Depends(require_role("admin")),
):
    result = await db.execute(select(Participant).where(Participant.id == participant_id))
    participant = result.scalar_one_or_none()
    if not participant:
        raise HTTPException(status_code=404, detail="Participant not found")
    if participant.id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    await db.execute(sq_delete(Participant).where(Participant.id == participant_id))
    return {"message": "Participant deleted", "id": participant_id}

