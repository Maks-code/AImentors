from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import uuid4
from app.database import get_db
from app.auth.jwt_handler import get_current_user, TokenData
from app.schemas.chat import ChatRequest, ChatResponse
from app.models.chat import ChatMessage
import os
import httpx
from dotenv import load_dotenv
from app.models.user import User
from app.utils.openai_chat import openai_chat

mentors = {
    "english": {
        "name": "English Mentor",
        "system_prompt": "Ты профессиональный преподаватель английского языка. Объясняй понятно, чётко и с примерами."
    },
    "python": {
        "name": "Python Mentor",
        "system_prompt": "Ты опытный наставник по Python. Помогай понятно, как другу-новичку."
    }
}

load_dotenv()

router = APIRouter()

@router.post("/chat")
async def chat(
    chat_data: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    mentor = mentors.get(chat_data.mentor_id)
    if not mentor:
        raise HTTPException(status_code=404, detail="Наставник не найден")

    system_prompt = mentor["system_prompt"]

    try:
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": chat_data.prompt}
        ]
        response = await openai_chat(messages)
        new_message = ChatMessage(
            user_id=current_user.id,
            prompt=chat_data.prompt,
            response=response
        )
        db.add(new_message)
        db.commit()

        return {"mentor": mentor["name"], "response": response}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/chat/history")
def get_chat_history(
    db: Session = Depends(get_db),
    token_data: TokenData = Depends(get_current_user)
):
    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.user_id == token_data.sub)
        .order_by(ChatMessage.created_at.desc())
        .all()
    )

    return [
        {
            "id": msg.id,
            "prompt": msg.prompt,
            "response": msg.response,
            "created_at": msg.created_at
        }
        for msg in messages
    ]