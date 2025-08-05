# app/routers/mentors.py

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from uuid import uuid4
from app.database import get_db
from app.models.mentor import Mentor
from app.schemas.mentor import MentorOut, MentorCreate


router = APIRouter()

@router.post("/mentors", response_model=MentorOut)
def create_mentor(mentor: MentorCreate, db: Session = Depends(get_db)):
    new_mentor = Mentor(
        id=str(uuid4()),
        name=mentor.name,
        description=mentor.description,
        subject=mentor.subject,
        system_prompt=mentor.system_prompt
    )
    db.add(new_mentor)
    db.commit()
    db.refresh(new_mentor)
    return new_mentor

@router.get("/mentors", response_model=list[MentorOut])
def get_all_mentors(db: Session = Depends(get_db)):
    return db.query(Mentor).all()