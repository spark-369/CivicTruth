from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional

class SettingBase(BaseModel):
    key: str = Field(min_length=1, max_length=128)
    value: Optional[str] = None
    value_type: str = Field(default="string", max_length=32)
    description: Optional[str] = None

class SettingUpdate(BaseModel):
    value: Optional[str] = None
    value_type: Optional[str] = Field(None, max_length=32)
    description: Optional[str] = None

class SettingResponse(SettingBase):
    id: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
