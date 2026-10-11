from sqlalchemy import Column, String, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
import uuid
from app.database import Base
from app.utils.time import utcnow_naive

class Participant(Base):
    __tablename__ = "participants"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    full_name = Column(String, nullable=False, index=True)
    national_id_hash = Column(String, unique=True, nullable=False, index=True)
    dob = Column(DateTime, nullable=True)
    bio = Column(String, nullable=True)
    email = Column(String, nullable=True, index=True)
    password_hash = Column(String, nullable=False)
    role = Column(String, nullable=False, default="participant", index=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utcnow_naive)
    updated_at = Column(DateTime, default=utcnow_naive, onupdate=utcnow_naive)

    blocks = relationship("Block", back_populates="participant", cascade="all, delete-orphan")
