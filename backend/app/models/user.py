# SQLAlchemy модели для таблиц users, mentors и chat_messages соответственно.
# Настроены связи, UUID-поля и constraints.

from sqlalchemy import Column, String, DateTime, Boolean
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from uuid import uuid4

from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)

    role = Column(String, default="student")  # или admin / mentor
    full_name = Column(String, nullable=True)
    username = Column(String, nullable=True)
    bio = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)

    created_at = Column(DateTime(timezone=True), server_default=func.now())

    chat_messages = relationship("ChatMessage", back_populates="user")
    subscriptions = relationship("Subscription", back_populates="user")