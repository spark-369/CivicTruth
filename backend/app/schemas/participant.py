from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional

class ParticipantBase(BaseModel):
    full_name: str
    dob: Optional[datetime] = None
    bio: Optional[str] = None
    email: Optional[EmailStr] = None

class ParticipantCreate(ParticipantBase):
    pass

class ParticipantUpdate(BaseModel):
    full_name: Optional[str] = None
    dob: Optional[str] = None
    bio: Optional[str] = None
    email: Optional[EmailStr] = None
    is_active: Optional[bool] = None

class ParticipantResponse(ParticipantBase):
    id: str
    national_id_hash: Optional[str] = None
    role: str
    is_active: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

