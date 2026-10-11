from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class NotificationCreate(BaseModel):
    title: str = Field(min_length=1, max_length=256)
    message: str = Field(min_length=1)

class NotificationResponse(BaseModel):
    id: str
    title: str
    message: str
    created_by: str
    participant_id: Optional[str] = None
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

class NotificationReadUpdate(BaseModel):
    is_read: bool = True

class NotificationUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=256)
    message: Optional[str] = Field(None, min_length=1)
