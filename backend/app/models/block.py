from sqlalchemy import Column, String, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
import uuid
from app.database import Base
from app.utils.time import utcnow_naive

class Block(Base):
    __tablename__ = "blocks"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    participant_id = Column(String(36), ForeignKey("participants.id"), nullable=False)
    transaction_type = Column(String, nullable=False)
    transaction_data = Column(Text, nullable=False)
    data_hash = Column(String, nullable=False, index=True)
    parent_hash = Column(String, nullable=True)
    block_hash = Column(String, nullable=False, unique=True, index=True)
    ai_verification_score = Column(String, nullable=True)
    ai_verification_label = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    image_features = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utcnow_naive)

    participant = relationship("Participant", back_populates="blocks")