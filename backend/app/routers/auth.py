from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models.participant import Participant
from app.schemas.participant import ParticipantResponse, ParticipantUpdate
from app.deps import get_current_user, require_role
from app.utils.security import create_access_token, hash_identifier, hash_password, verify_password
from app.config import settings
from app.models.settings import Setting as SettingModel
from app.utils.time import parse_iso_date
from pydantic import BaseModel, Field
from datetime import timedelta

class RegisterRequest(BaseModel):
    national_id: str = Field(min_length=1, max_length=128)
    full_name: str = Field(min_length=1, max_length=256)
    password: str = Field(min_length=8, max_length=128)
    dob: str = Field(default="", max_length=64)
    bio: str = Field(default="", max_length=1024)
    email: str = Field(default="", max_length=256)


class LoginRequest(BaseModel):
    national_id: str = Field(min_length=1, max_length=128)
    password: str = Field(min_length=1, max_length=128)


router = APIRouter(prefix="/auth", tags=["auth"])


def _mask_national_id(national_id: str) -> str:
    if len(national_id) <= 4:
        return "*" * len(national_id)
    return national_id[:4] + "*" * (len(national_id) - 4)


async def _get_session_timeout(db: AsyncSession) -> int:
    val = (await db.execute(select(SettingModel.value).where(SettingModel.key == "session.timeout"))).scalar_one_or_none()
    if val is not None:
        try:
            return int(val)
        except ValueError:
            pass
    return settings.ACCESS_TOKEN_EXPIRE_MINUTES


@router.post("/register", response_model=dict)
async def register(payload: RegisterRequest, db: AsyncSession = Depends(get_db)):
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
    token = create_access_token({"sub": str(participant.id), "role": participant.role, "full_name": participant.full_name, "national_id_hash": participant.national_id_hash}, expires_delta=timedelta(minutes=await _get_session_timeout(db)))
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": participant.role,
        "participant": {
            "id": str(participant.id),
            "full_name": participant.full_name,
            "national_id_mask": _mask_national_id(payload.national_id),
            "dob": participant.dob,
            "bio": participant.bio,
            "role": participant.role,
            "is_active": participant.is_active,
            "created_at": participant.created_at,
        }
    }


@router.post("/login", response_model=dict)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)):
    nid_hash = hash_identifier(payload.national_id)
    participant = (await db.execute(select(Participant).where(Participant.national_id_hash == nid_hash))).scalar_one_or_none()
    if not participant:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not verify_password(payload.password, participant.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": str(participant.id), "role": participant.role, "full_name": participant.full_name, "national_id_hash": participant.national_id_hash}, expires_delta=timedelta(minutes=await _get_session_timeout(db)))
    return {
        "access_token": token,
        "token_type": "bearer",
        "role": participant.role,
        "participant": {
            "id": str(participant.id),
            "full_name": participant.full_name,
            "email": participant.email,
            "dob": participant.dob,
            "bio": participant.bio,
            "role": participant.role,
            "is_active": participant.is_active,
            "created_at": participant.created_at,
        }
    }


@router.get("/me", response_model=ParticipantResponse)
async def get_me(current_user: Participant = Depends(get_current_user)):
    return ParticipantResponse.model_validate(current_user)


@router.put("/me", response_model=ParticipantResponse)
async def update_me(
    payload: ParticipantUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: Participant = Depends(get_current_user),
):
    participant = (await db.execute(select(Participant).where(Participant.id == current_user.id))).scalar_one_or_none()
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

    await db.flush()
    await db.refresh(participant)
    return ParticipantResponse.model_validate(participant)
