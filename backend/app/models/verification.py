from sqlalchemy import Column, String, DateTime, Text, ForeignKey, Float
from sqlalchemy.orm import relationship
import uuid
from app.database import Base
from app.utils.time import utcnow_naive

class VerificationRecord(Base):
    __tablename__ = "verification_records"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    participant_id = Column(String(36), ForeignKey("participants.id"), nullable=True)
    block_id = Column(String(36), ForeignKey("blocks.id"), nullable=True)
    input_text = Column(Text, nullable=True)
    input_image_url = Column(String, nullable=True)
    ai_model_id = Column(String, nullable=False)
    prediction_label = Column(String, nullable=True)
    prediction_score = Column(Float, nullable=True)
    verified_by = Column(String, nullable=True)
    status = Column(String, default="pending")
    created_at = Column(DateTime, default=utcnow_naive)