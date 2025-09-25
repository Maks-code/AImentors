# app/schemas/learning.py
from pydantic import BaseModel, Field
from uuid import UUID
from typing import Optional, List, Any
from datetime import datetime

# -------- LearningPlan --------
class LearningPlanBase(BaseModel):
    title: str
    description: Optional[str] = None

class LearningPlanCreate(LearningPlanBase):
    mentor_id: UUID

class LearningPlanResponse(LearningPlanBase):
    id: UUID
    user_id: UUID
    mentor_id: UUID
    status: str
    created_at: datetime

    class Config:
        orm_mode = True


# -------- Module --------
class ModuleBase(BaseModel):
    title: str
    description: Optional[str] = None

class ModuleCreate(ModuleBase):
    plan_id: UUID

class ModuleResponse(ModuleBase):
    id: UUID
    plan_id: UUID
    order_index: int

    class Config:
        orm_mode = True


# -------- Lesson --------
class LessonBase(BaseModel):
    title: str
    type: str
    content: Optional[dict] = None

class LessonCreate(LessonBase):
    module_id: UUID

class LessonResponse(LessonBase):
    id: UUID
    module_id: UUID
    order_index: int

    class Config:
        orm_mode = True


# -------- Task --------
class TaskBase(BaseModel):
    question: str
    type: str
    options: Optional[Any] = None
    answer: Optional[str] = None

class TaskCreate(TaskBase):
    lesson_id: UUID

class TaskResponse(TaskBase):
    id: UUID
    lesson_id: UUID
    order_index: int

    class Config:
        orm_mode = True


class LessonWithTasks(LessonResponse):
    tasks: List[TaskResponse] = Field(default_factory=list)
    user_progress_status: Optional[str] = None


class ModuleWithLessons(ModuleResponse):
    lessons: List[LessonWithTasks] = Field(default_factory=list)


class LearningPlanDetailResponse(LearningPlanResponse):
    modules: List[ModuleWithLessons] = Field(default_factory=list)


# -------- Progress --------
class ProgressBase(BaseModel):
    status: str
    score: Optional[int] = None

class ProgressCreate(ProgressBase):
    lesson_id: UUID

class ProgressResponse(ProgressBase):
    id: UUID
    user_id: UUID
    lesson_id: UUID
    updated_at: datetime

    class Config:
        orm_mode = True
