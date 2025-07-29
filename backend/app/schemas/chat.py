from pydantic import BaseModel

class ChatRequest(BaseModel):
    prompt: str
    mentor_id: str

class ChatResponse(BaseModel):
    response: str