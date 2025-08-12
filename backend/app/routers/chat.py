from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from sqlalchemy import distinct, and_
from uuid import UUID
from app.core.config import settings
from app.database import get_db
from app.auth.jwt_handler import get_current_user
from app.schemas.chat import ChatRequest, ChatResponse
from app.models.chat import ChatMessage
from app.models.mentor import Mentor
from app.models.user import User
from app.utils.openai_chat import openai_chat
from app.utils.rate_limit import rate_limit, enforce_daily_quota  # <= наши лимиты

MAX_HISTORY_MESSAGES = 10  # сколько последних сообщений подтягиваем в контекст LLM
router = APIRouter()


# --- зависимость: минутный лимит + дневная квота ---
async def chat_rate_limit_dep(request: Request):
    # минутный лимит и окно — из .env (через settings)
    await rate_limit(
        request,
        limit=settings.RATE_LIMIT_PER_MIN,
        window=settings.RATE_BURST_WINDOW,
        bucket_prefix="chat",
    )
    # суточная квота — из .env (через settings)
    await enforce_daily_quota(
        request,
        limit=settings.DAILY_MSG_LIMIT,
        bucket_prefix="chat",
    )

# отправка запроса чатику
@router.post("/send", response_model=ChatResponse)
async def chat(
    chat_data: ChatRequest,                      # тело запроса
    _rl: None = Depends(chat_rate_limit_dep),   # лимиты (выполняется ДО логики)
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    # проверяем, что ментор существует
    mentor: Mentor | None = db.query(Mentor).filter(Mentor.id == chat_data.mentor_id).first()
    if not mentor:
        raise HTTPException(status_code=404, detail="Наставник не найден")

    system_prompt = mentor.system_prompt or ""  # подстрахуемся от None

    # последние N сообщений этого пользователя с этим ментором
    history_messages = (
        db.query(ChatMessage)
        .filter(
            ChatMessage.user_id == current_user.id,
            ChatMessage.mentor_id == chat_data.mentor_id,
        )
        .order_by(ChatMessage.created_at.desc())
        .limit(MAX_HISTORY_MESSAGES)
        .all()
    )

    try:
        messages = [{"role": "system", "content": system_prompt}]

        # история в правильном порядке: от старых к новым
        for msg in reversed(history_messages):
            messages.append({"role": "user", "content": msg.prompt})
            messages.append({"role": "assistant", "content": msg.response})

        # новое сообщение пользователя
        messages.append({"role": "user", "content": chat_data.prompt})

        # ответ от LLM
        answer: str = await openai_chat(messages)

        # защита: пустой ответ → 502 с понятным текстом
        if not answer or not str(answer).strip():
            raise HTTPException(status_code=502, detail="LLM returned empty response")

        # сохраняем в БД
        new_message = ChatMessage(
            user_id=current_user.id,
            mentor_id=chat_data.mentor_id,
            prompt=chat_data.prompt,
            response=answer,
        )
        db.add(new_message)
        db.commit()

        return ChatResponse(response=answer)

    except HTTPException:
        # пропускаем уже сформированные ошибки (429/404/502 и т.д.)
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# список менторов, с которыми у пользователя была переписка
@router.get("/history")
def get_chat_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    mentor_ids = (
        db.query(distinct(ChatMessage.mentor_id))
        .filter(ChatMessage.user_id == current_user.id)
        .all()
    )
    mentor_ids = [row[0] for row in mentor_ids]  # распаковка DISTINCT

    if not mentor_ids:
        return []

    mentors = db.query(Mentor).filter(Mentor.id.in_(mentor_ids)).all()

    return [
        {
            "id": str(m.id),
            "name": m.name,
            "subject": m.subject,
            "description": getattr(m, "description", "") or getattr(m, "bio", "") or "",
        }
        for m in mentors
    ]


# вся переписка с конкретным ментором
@router.get("/history/{mentor_id}")
def get_chat_history_with_mentor(
    mentor_id: UUID,
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
            "created_at": msg.created_at.isoformat(),
        }
        for msg in messages
    ]
# удалить историю чата пользователя с ментором
@router.delete("/history/{mentor_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_chat_history_with_mentor(
    mentor_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Удаляем только сообщения текущего пользователя с этим ментором
    db.query(ChatMessage).filter(
        and_(
            ChatMessage.user_id == current_user.id,
            ChatMessage.mentor_id == mentor_id,
        )
    ).delete(synchronize_session=False)

    db.commit()
    # 204 без тела
    return

