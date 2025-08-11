from pydantic import BaseModel, field_validator
from uuid import UUID

MAX_PROMPT_LEN = 4000  # при желании вынеси в конфиг

class ChatRequest(BaseModel):
    prompt: str
    mentor_id: UUID  # Pydantic сам распарсит строку UUID -> UUID

    @field_validator("prompt")
    @classmethod
    def validate_prompt(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Prompt is empty")
        v = v.strip()
        if len(v) > MAX_PROMPT_LEN:
            raise ValueError(f"Prompt too long (>{MAX_PROMPT_LEN} chars)")
        return v

class ChatResponse(BaseModel):
    response: str