# app/schemas/mentor.py

from pydantic import BaseModel

class MentorCreate(BaseModel):
    name: str
    description: str
    subject: str
    system_prompt: str

class MentorOut(MentorCreate):
    id: str