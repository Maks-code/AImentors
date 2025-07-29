# запросы с логином

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import os
import httpx
from dotenv import load_dotenv

from app.auth.jwt_handler import get_current_user, TokenData

load_dotenv()
router = APIRouter()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise RuntimeError("OPENAI_API_KEY not set in .env")

class PromptRequest(BaseModel):
    prompt: str

@router.post("/ask")
async def ask_ai(
    data: PromptRequest,
    token_data: TokenData = Depends(get_current_user)  # 👈 авторизация
):
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENAI_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "gpt-3.5-turbo",
                    "messages": [{"role": "user", "content": data.prompt}],
                    "temperature": 0.7,
                },
            )

        result = response.json()
        return {
            "response": result["choices"][0]["message"]["content"],
            "user_id": token_data.sub,  # 👈 можно сохранять в будущем
        }

    except Exception as e:
        print("❌ OpenAI API Error:", e)
        raise HTTPException(status_code=500, detail="AI response failed")



"""
# запросы без логина

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os
import httpx
from dotenv import load_dotenv

load_dotenv()
router = APIRouter()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    raise RuntimeError("OPENAI_API_KEY not set in .env")

class PromptRequest(BaseModel):
    prompt: str

@router.post("/ask")
async def ask_ai(data: PromptRequest):
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {OPENAI_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": "gpt-3.5-turbo",
                    "messages": [{"role": "user", "content": data.prompt}],
                    "temperature": 0.7,
                },
            )

        result = response.json()
        return {
            "response": result["choices"][0]["message"]["content"]
        }

    except Exception as e:
        print("❌ OpenAI API Error:", e)
        raise HTTPException(status_code=500, detail="AI response failed")
"""