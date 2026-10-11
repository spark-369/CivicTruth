from sqlalchemy import Column, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
import uuid
from app.database import Base
from app.utils.time import utcnow_naive

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(256), nullable=False)
    message = Column(Text, nullable=False)
    created_by = Column(String(36), ForeignKey("participants.id"), nullable=False)
    participant_id = Column(String(36), ForeignKey("participants.id"), nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=utcnow_naive)

    creator = relationship("Participant", foreign_keys=[created_by])
    participant = relationship("Participant", foreign_keys=[participant_id])
