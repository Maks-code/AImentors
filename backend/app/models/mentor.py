# app/models/mentor.py

from sqlalchemy import Column, String, Text
from app.database import Base

class Mentor(Base):
    __tablename__ = "mentors"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    subject = Column(String, nullable=False)
    system_prompt = Column(Text, nullable=False)