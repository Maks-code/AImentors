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
    LearningPlanCreate,
    LearningPlanResponse,
    LearningPlanDetailResponse,
    ModuleCreate,
    ModuleResponse,
    LessonCreate,
    LessonResponse,
    TaskCreate,
    TaskResponse,
    ProgressCreate,
    ProgressResponse,
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
        .filter(
            LearningPlan.user_id == current_user.id,
            LearningPlan.status.in_(["confirmed", "completed"]),
        )
        .order_by(LearningPlan.created_at.desc())
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
    if plan.status == "deleted":
        return {"message": "Plan already deleted"}

    plan.status = "deleted"
    db.commit()
    db.refresh(plan)
    return {"message": "Plan deleted successfully", "plan_id": plan.id}


@router.get("/plans/{plan_id}", response_model=LearningPlanDetailResponse)
def get_plan(plan_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    plan = (
        db.query(LearningPlan)
        .options(
            joinedload(LearningPlan.modules)
            .joinedload(Module.lessons)
            .joinedload(Lesson.tasks)
        )
        .filter(and_(LearningPlan.id == plan_id, LearningPlan.user_id == current_user.id))
        .first()
    )
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    if plan.status not in {"confirmed", "completed"}:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Plan is not confirmed")

    lesson_ids: list[UUID] = []
    for module in plan.modules:
        for lesson in module.lessons:
            lesson_ids.append(lesson.id)

    progress_map: dict[UUID, str] = {}
    if lesson_ids:
        progress_rows = (
            db.query(Progress.lesson_id, Progress.status)
            .filter(
                Progress.user_id == current_user.id,
                Progress.lesson_id.in_(lesson_ids),
            )
            .all()
        )
        progress_map = {row[0]: row[1] for row in progress_rows}

    # ensure deterministic ordering when serializing nested entities
    plan.modules.sort(key=lambda module: module.order_index)
    for module in plan.modules:
        module.lessons.sort(key=lambda lesson: lesson.order_index)
        for lesson in module.lessons:
            lesson.tasks.sort(key=lambda task: task.order_index)
            lesson.user_progress_status = progress_map.get(lesson.id)
    return plan


@router.get("/plans/{plan_id}/status")
def get_plan_status(plan_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    plan = (
        db.query(LearningPlan)
        .filter(and_(LearningPlan.id == plan_id, LearningPlan.user_id == current_user.id))
        .first()
    )
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")

    return {"plan_id": plan.id, "status": plan.status}


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
    lesson_with_plan = (
        db.query(Lesson, LearningPlan.id.label("plan_id"))
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

    if not lesson_with_plan:
        raise HTTPException(status_code=403, detail="Lesson not found or not owned by you")

    lesson_obj, plan_id = lesson_with_plan

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
        if progress.status is not None:
            db_progress.status = progress.status
        if progress.score is not None:
            db_progress.score = progress.score
    else:
        db_progress = Progress(
            user_id=current_user.id,
            lesson_id=lesson_obj.id,
            status=progress.status or "not_started",
            score=progress.score,
        )
        db.add(db_progress)

    # Ensure current changes are visible for aggregation
    db.flush()

    plan = (
        db.query(LearningPlan)
        .filter(
            and_(
                LearningPlan.id == plan_id,
                LearningPlan.user_id == current_user.id,
            )
        )
        .first()
    )

    if plan and plan.status != "deleted":
        total_lessons = (
            db.query(Lesson.id)
            .join(Module, Lesson.module_id == Module.id)
            .filter(Module.plan_id == plan_id)
            .count()
        )

        completed_lessons = (
            db.query(Progress.id)
            .join(Lesson, Progress.lesson_id == Lesson.id)
            .join(Module, Lesson.module_id == Module.id)
            .filter(
                Module.plan_id == plan_id,
                Progress.user_id == current_user.id,
                Progress.status == "completed",
            )
            .count()
        )

        if total_lessons and completed_lessons >= total_lessons:
            plan.status = "completed"
        elif plan.status == "completed":
            plan.status = "confirmed"

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

@router.patch("/plans/{plan_id}/reject")
def reject_plan(plan_id: str, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    plan = db.query(LearningPlan).filter(
        LearningPlan.id == plan_id,
        LearningPlan.user_id == current_user.id
    ).first()
    if not plan:
        raise HTTPException(status_code=404, detail="План не найден")

    plan.status = "deleted"
    db.commit()
    db.refresh(plan)
    return {"message": "План отклонён (помечен как deleted)", "plan_id": plan.id}
