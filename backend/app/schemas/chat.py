from pydantic import BaseModel
from uuid import UUID

class ChatRequest(BaseModel):
    prompt: str
    mentor_id: str

class ChatResponse(BaseModel):
    response: str