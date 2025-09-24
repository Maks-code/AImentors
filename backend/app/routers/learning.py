from fastapi import status
# app/routers/learning.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_
from uuid import UUID

from app.database import get_db
from app.models import LearningPlan, Module, Lesson, Task, Progress
from app.models.user import User
from app.auth.jwt_handler import get_current_user
from app.schemas.learning import (
    LearningPlanCreate, LearningPlanResponse,
    ModuleCreate, ModuleResponse,
    LessonCreate, LessonResponse,
    TaskCreate, TaskResponse,
    ProgressCreate, ProgressResponse
)

router = APIRouter(prefix="/learning", tags=["Learning"])

# -------- LearningPlans --------
@router.post("/plans", response_model=LearningPlanResponse)
def create_plan(
    plan: LearningPlanCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    db_plan = LearningPlan(
        title=plan.title,
        description=plan.description,
        mentor_id=plan.mentor_id,
        user_id=current_user.id,
    )
    db.add(db_plan)
    db.commit()
    db.refresh(db_plan)
    return db_plan

@router.get("/plans", response_model=list[LearningPlanResponse])
def get_plans(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    plans = (
        db.query(LearningPlan)
        .options(
            joinedload(LearningPlan.modules)
            .joinedload(Module.lessons)
            .joinedload(Lesson.tasks),
            joinedload(LearningPlan.mentor)
        )
        .filter(LearningPlan.user_id == current_user.id)
        .all()
    )
    return plans


# ----------- DELETE PLAN -----------
@router.delete("/plans/{plan_id}")
def delete_plan(plan_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    plan = (
        db.query(LearningPlan)
        .filter(and_(LearningPlan.id == plan_id, LearningPlan.user_id == current_user.id))
        .first()
    )
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    db.delete(plan)
    db.commit()
    return {"message": "Plan deleted successfully"}


@router.get("/plans/{plan_id}", response_model=LearningPlanResponse)
def get_plan(plan_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    plan = (
        db.query(LearningPlan)
        .filter(and_(LearningPlan.id == plan_id, LearningPlan.user_id == current_user.id))
        .first()
    )
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    return plan


# -------- Modules --------
@router.post("/modules", response_model=ModuleResponse)
def create_module(
    module: ModuleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # проверяем, что план существует и принадлежит юзеру
    plan = (
        db.query(LearningPlan)
        .filter(and_(LearningPlan.id == module.plan_id, LearningPlan.user_id == current_user.id))
        .first()
    )
    if not plan:
        raise HTTPException(status_code=403, detail="Plan not found or not owned by you")

    db_module = Module(
        plan_id=module.plan_id,
        title=module.title,
        description=module.description,
    )
    db.add(db_module)
    db.commit()
    db.refresh(db_module)
    return db_module


# ----------- DELETE MODULE -----------
@router.delete("/modules/{module_id}")
def delete_module(module_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    module = (
        db.query(Module)
        .join(LearningPlan, Module.plan_id == LearningPlan.id)
        .filter(and_(Module.id == module_id, LearningPlan.user_id == current_user.id))
        .first()
    )
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    db.delete(module)
    db.commit()
    return {"message": "Module deleted successfully"}


# -------- Lessons --------
@router.post("/lessons", response_model=LessonResponse)
def create_lesson(
    lesson: LessonCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # проверяем, что модуль принадлежит плану текущего юзера
    mod = (
        db.query(Module)
        .join(LearningPlan, Module.plan_id == LearningPlan.id)
        .filter(and_(Module.id == lesson.module_id, LearningPlan.user_id == current_user.id))
        .first()
    )
    if not mod:
        raise HTTPException(status_code=403, detail="Module not found or not owned by you")

    db_lesson = Lesson(
        module_id=lesson.module_id,
        title=lesson.title,
        type=lesson.type,
        content=lesson.content,
    )
    db.add(db_lesson)
    db.commit()
    db.refresh(db_lesson)
    return db_lesson


# ----------- DELETE LESSON -----------
@router.delete("/lessons/{lesson_id}")
def delete_lesson(lesson_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    lesson = (
        db.query(Lesson)
        .join(Module, Lesson.module_id == Module.id)
        .join(LearningPlan, Module.plan_id == LearningPlan.id)
        .filter(and_(Lesson.id == lesson_id, LearningPlan.user_id == current_user.id))
        .first()
    )
    if not lesson:
        raise HTTPException(status_code=404, detail="Lesson not found")
    db.delete(lesson)
    db.commit()
    return {"message": "Lesson deleted successfully"}


# -------- Tasks --------
@router.post("/tasks", response_model=TaskResponse)
def create_task(
    task: TaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # проверяем, что урок принадлежит модулю -> плану текущего юзера
    les = (
        db.query(Lesson)
        .join(Module, Lesson.module_id == Module.id)
        .join(LearningPlan, Module.plan_id == LearningPlan.id)
        .filter(and_(Lesson.id == task.lesson_id, LearningPlan.user_id == current_user.id))
        .first()
    )
    if not les:
        raise HTTPException(status_code=403, detail="Lesson not found or not owned by you")

    db_task = Task(
        lesson_id=task.lesson_id,
        question=task.question,
        type=task.type,
        options=task.options,
        answer=task.answer,
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task


# ----------- DELETE TASK -----------
@router.delete("/tasks/{task_id}")
def delete_task(task_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    task = (
        db.query(Task)
        .join(Lesson, Task.lesson_id == Lesson.id)
        .join(Module, Lesson.module_id == Module.id)
        .join(LearningPlan, Module.plan_id == LearningPlan.id)
        .filter(and_(Task.id == task_id, LearningPlan.user_id == current_user.id))
        .first()
    )
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(task)
    db.commit()
    return {"message": "Task deleted successfully"}


# -------- Progress --------
@router.post("/progress", response_model=ProgressResponse)
def create_progress(
    progress: ProgressCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # 1) Проверяем, что урок принадлежит плану текущего пользователя
    lesson = (
        db.query(Lesson)
        .join(Module, Lesson.module_id == Module.id)
        .join(LearningPlan, Module.plan_id == LearningPlan.id)
        .filter(
            and_(
                Lesson.id == progress.lesson_id,
                LearningPlan.user_id == current_user.id,
            )
        )
        .first()
    )
    if not lesson:
        # либо урок не существует, либо он не в вашем плане
        raise HTTPException(status_code=403, detail="Lesson not found or not owned by you")

    # 2) Идемпотентность: если запись существует — обновляем; иначе создаём
    db_progress = (
        db.query(Progress)
        .filter(
            and_(
                Progress.user_id == current_user.id,
                Progress.lesson_id == progress.lesson_id,
            )
        )
        .first()
    )

    if db_progress:
        # обновляем только присланные поля
        if progress.status is not None:
            db_progress.status = progress.status
        if progress.score is not None:
            db_progress.score = progress.score
    else:
        db_progress = Progress(
            user_id=current_user.id,      # берём из токена
            lesson_id=progress.lesson_id,
            status=progress.status or "not_started",
            score=progress.score,
        )
        db.add(db_progress)

    db.commit()
    db.refresh(db_progress)
    return db_progress


# ----------- DELETE PROGRESS -----------
@router.delete("/progress/{progress_id}")
def delete_progress(progress_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    progress = (
        db.query(Progress)
        .filter(and_(Progress.id == progress_id, Progress.user_id == current_user.id))
        .first()
    )
    if not progress:
        raise HTTPException(status_code=404, detail="Progress not found")
    db.delete(progress)
    db.commit()
    return {"message": "Progress deleted successfully"}



@router.patch("/plans/{plan_id}/confirm")
def confirm_plan(plan_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    plan = db.query(LearningPlan).filter(
        LearningPlan.id == plan_id,
        LearningPlan.user_id == current_user.id
    ).first()
    if not plan:
        raise HTTPException(status_code=404, detail="План не найден")

    plan.status = "confirmed"
    db.commit()
    db.refresh(plan)
    return {"message": "План подтвержден", "plan_id": plan.id}