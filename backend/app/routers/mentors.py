# app/routers/mentors.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import uuid4
from app.database import get_db
from app.models.mentor import Mentor
from app.schemas.mentor import MentorOut, MentorCreate
from app.models.user import User
from app.models.chat import ChatMessage
from uuid import UUID
router = APIRouter()

@router.post("/", response_model=MentorOut)
def create_mentor(mentor: MentorCreate, db: Session = Depends(get_db)):
    new_mentor = Mentor(
        id=str(uuid4()),
        name=mentor.name,
        description=mentor.description,
        subject=mentor.subject,
        system_prompt=mentor.system_prompt,
        avatar_url=mentor.avatar_url
    )
    db.add(new_mentor)
    db.commit()
    db.refresh(new_mentor)
    return new_mentor

@router.get("/", response_model=list[MentorOut])
def get_all_mentors(db: Session = Depends(get_db)):
    try:
        mentors = db.query(Mentor).all()
        print("✅ mentors из БД:", mentors)
        return mentors
    except Exception as e:
        import traceback
        print("❌ Ошибка в get_all_mentors:", e)
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/active_mentors/{user_id}")
def get_active_mentors(user_id: UUID, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    chat_messages = db.query(ChatMessage).filter(ChatMessage.user_id == user_id).all()
    if not chat_messages:
        raise HTTPException(status_code=404, detail="No active conversations found")
    
    mentor_ids = set(chat_message.mentor_id for chat_message in chat_messages)
    active_mentors = db.query(Mentor).filter(Mentor.id.in_(mentor_ids)).all()

    return active_mentors