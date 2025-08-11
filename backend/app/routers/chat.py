# Роут /chat — основной чат с ментором (mentor_id + prompt).
# Создаёт запись в БД и возвращает ответ от ИИ.

# Короче говоря здесь описаны все ручки связанные с взаимодействием с чатиком 
# (запрос истории, отправка запроса чатику, получение ответа и прочее)

from app.models.mentor import Mentor
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
from sqlalchemy import select, distinct
load_dotenv()

router = APIRouter()
# отправка запроса чатику
@router.post("/send")
async def chat(
    chat_data: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    mentor_obj = db.query(Mentor).filter(Mentor.id == chat_data.mentor_id).first()
    if not mentor_obj:
        raise HTTPException(status_code=404, detail="Наставник не найден")
    system_prompt = mentor_obj.system_prompt

    try:
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": chat_data.prompt}
        ]
        response = await openai_chat(messages)
        new_message = ChatMessage(
            user_id=current_user.id,
            mentor_id=chat_data.mentor_id,
            prompt=chat_data.prompt,
            response=response
        )
        db.add(new_message)
        db.commit()

        return {"mentor": mentor_obj.name, "response": response}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Эта ручка возвращает список менторов с которыми общался пользователь!!! (к которым был запрос)
@router.get("/history") 
def get_chat_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Получаем уникальные mentor_id, с которыми у пользователя были чаты
    mentor_ids = (
        db.query(distinct(ChatMessage.mentor_id))
        .filter(ChatMessage.user_id == current_user.id)
        .all()
    )

    # Извлекаем ID-шники
    mentor_ids = [row[0] for row in mentor_ids]

    # Получаем сами объекты менторов
    mentors = (
        db.query(Mentor)
        .filter(Mentor.id.in_(mentor_ids))
        .all()
    )

    return [ 
        {
            "id": str(mentor.id),
            "name": mentor.name,
            "subject": mentor.subject,
            "description": mentor.description
        }
        for mentor in mentors
    ]

# Эта ручка возвращает историю переписки с конкретным ментором
@router.get("/history/{mentor_id}")
def get_chat_history_with_mentor(
    mentor_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    messages = (
        db.query(ChatMessage)
        .filter(
            ChatMessage.user_id == current_user.id,
            ChatMessage.mentor_id == mentor_id,
        )
        .order_by(ChatMessage.created_at.asc())
        .all()
    )

    return [
        {
            "id": str(msg.id),
            "prompt": msg.prompt,
            "response": msg.response,
            "created_at": msg.created_at.isoformat()
        }
        for msg in messages
    ]
