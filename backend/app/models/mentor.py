from sqlalchemy import Column, String, Text, Boolean, Integer
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from uuid import uuid4

from app.database import Base

class Mentor(Base):
    __tablename__ = "mentors"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    name = Column(String, nullable=False)
    subject = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    system_prompt = Column(Text, nullable=True)
    avatar_url = Column(String, nullable=True)
    is_public = Column(Boolean, default=True)
    order_index = Column(Integer, default=0)
    chat_messages = relationship("ChatMessage", back_populates="mentor")
    plans = relationship("LearningPlan", back_populates="mentor")