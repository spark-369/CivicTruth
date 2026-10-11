from pydantic import BaseModel, HttpUrl, model_validator
from datetime import datetime
from typing import Optional, List

class BlockCreate(BaseModel):
    participant_id: str
    transaction_type: str
    transaction_data: Optional[str] = None
    image_url: Optional[HttpUrl] = None

    @model_validator(mode='after')
    def check_data_or_image(self):
        if not self.transaction_data and not self.image_url:
            raise ValueError('Either transaction_data or image_url must be provided')
        return self

class BlockUpdate(BaseModel):
    transaction_type: Optional[str] = None
    transaction_data: Optional[str] = None
    image_url: Optional[HttpUrl] = None

class BlockResponse(BaseModel):
    id: str
    participant_id: str
    participant_name: Optional[str] = None
    transaction_type: str
    transaction_data: Optional[str] = None
    data_hash: str
    block_hash: str
    ai_verification_score: Optional[str] = None
    ai_verification_label: Optional[str] = None
    image_url: Optional[str] = None
    image_features: Optional[List[float]] = None
    created_at: datetime

    class Config:
        from_attributes = True

class BlockchainVerifyResponse(BaseModel):
    valid: bool
    blocks_checked: int
    broken_at: Optional[str] = None