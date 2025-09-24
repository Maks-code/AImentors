import uuid
from sqlalchemy import Text, String, Integer, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship, Mapped, mapped_column
from app.database import Base


class Task(Base):
    __tablename__ = "tasks"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    lesson_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("lessons.id", ondelete="CASCADE"))
    question: Mapped[str] = mapped_column(Text, nullable=False)
    answer: Mapped[str | None] = mapped_column(Text)
    type: Mapped[str] = mapped_column(String, nullable=False)  # open, multiple_choice, code
    options: Mapped[dict | None] = mapped_column(JSON)
    order_index: Mapped[int] = mapped_column(Integer, default=0)

    lesson = relationship("Lesson", back_populates="tasks")