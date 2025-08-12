# app/schemas/mentor.py

from uuid import UUID
from pydantic import BaseModel


class MentorOut(BaseModel):
    id: UUID
    name: str
    description: str
    subject: str
    system_prompt: str
    avatar_url: str  # Добавляем поле avatar_url
    class Config:
        orm_mode = True

class MentorCreate(BaseModel):
    name: str
    description: str
    subject: str
    system_prompt: str
    avatar_url: str 