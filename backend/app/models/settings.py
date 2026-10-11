from sqlalchemy import Column, String, Text, DateTime
import uuid
from app.database import Base
from app.utils.time import utcnow_naive

class Setting(Base):
    __tablename__ = "settings"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    key = Column(String(128), unique=True, nullable=False, index=True)
    value = Column(Text, nullable=True)
    value_type = Column(String(32), nullable=False, default="string")
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utcnow_naive)
    updated_at = Column(DateTime, default=utcnow_naive, onupdate=utcnow_naive)
