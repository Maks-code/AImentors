# Описание таблицы пользователей. Тут указываем, 
# какие у таблиц есть поля: email, пароль, имя и т.д.

from sqlalchemy import Column, String, DateTime, Boolean
from sqlalchemy.sql import func
from app.database import Base
from sqlalchemy.orm import relationship

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    is_verified = Column(Boolean, default=False)
    hashed_password = Column(String, nullable=False)
    # 👇 Новые поля
    full_name = Column(String, nullable=True)
    role = Column(String, default="student")  # или admin / mentor
    bio = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    chat_messages = relationship("ChatMessage", back_populates="user")