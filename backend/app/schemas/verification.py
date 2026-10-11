from pydantic import BaseModel, HttpUrl, model_validator
from datetime import datetime
from typing import Optional, List, Dict, Any

class VerificationCreate(BaseModel):
    participant_id: Optional[str] = None
    block_id: Optional[str] = None
    input_text: Optional[str] = None
    image_url: Optional[HttpUrl] = None

    @model_validator(mode='after')
    def check_input(self):
        if not self.input_text and not self.image_url:
            raise ValueError('Either input_text or image_url must be provided')
        return self

class MatchedBlock(BaseModel):
    id: str
    transaction_type: str
    transaction_data_preview: Optional[str] = None
    block_hash: Optional[str] = None
    created_at: Optional[datetime] = None
    image_url: Optional[str] = None
    image_features: Optional[List[float]] = None

    class Config:
        from_attributes = True

class VerificationResponse(BaseModel):
    id: str
    participant_id: Optional[str] = None
    block_id: Optional[str] = None
    input_text: str
    ai_model_id: str
    prediction_label: Optional[str] = None
    prediction_score: Optional[float] = None
    status: str
    matched_blocks: List[MatchedBlock] = []
    result_text: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True