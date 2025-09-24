from uuid import UUID
from pydantic import BaseModel

class MentorOut(BaseModel):
    id: UUID
    name: str
    description: str | None = None
    subject: str | None = None
    system_prompt: str | None = None
    avatar_url: str | None = None
    is_public: bool | None = None
    order_index: int | None = None

    class Config:
        from_attributes = True

class MentorCreate(BaseModel):
    name: str
    description: str | None = None
    subject: str | None = None
    system_prompt: str | None = None
    avatar_url: str | None = None