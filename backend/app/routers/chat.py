from uuid import UUID
import json
import re
import traceback
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
from app.models import LearningPlan, Module, Lesson, Task
from app.utils.openai_chat import openai_chat
from app.utils.rate_limit import rate_limit, enforce_daily_quota  # <= наши лимиты

MAX_HISTORY_MESSAGES = 10  # сколько последних сообщений подтягиваем в контекст LLM
router = APIRouter()

# --- helpers ---
def _extract_first_json(text: str) -> dict | None:
    """
    Try to extract the first JSON object from a raw LLM string.
    Handles cases like:
    - plain JSON
    - JSON inside triple backticks ```json ... ```
    - prose + JSON blob
    """
    if not isinstance(text, str) or not text.strip():
        return None

    # try direct parse
    try:
        return json.loads(text)
    except Exception:
        pass

    # try code block ```json ... ```
    m = re.search(r"```(?:json)?\s*([\s\S]*?)```", text, re.IGNORECASE)
    if m:
        snippet = m.group(1).strip()
        try:
            return json.loads(snippet)
        except Exception:
            pass

    # try to find first {...} that looks like JSON
    brace_start = text.find("{")
    brace_end = text.rfind("}")
    if brace_start != -1 and brace_end != -1 and brace_end > brace_start:
        candidate = text[brace_start: brace_end + 1]
        try:
            return json.loads(candidate)
        except Exception:
            return None

    return None

def _format_plan_for_chat(plan_draft: dict) -> str:
    title = plan_draft.get("title", "Untitled Plan")
    description = plan_draft.get("description", "")
    modules = plan_draft.get("modules", [])

    lines = []
    lines.append(f"📋 План: {title}")
    if description:
        lines.append(f"Описание: {description}")
    lines.append("")

    if not modules:
        return "\n".join(lines)

    for i, module in enumerate(modules, start=1):
        module_title = module.get("title", f"Модуль {i}")
        module_description = module.get("description", "")
        lines.append(f"{i}. Модуль: {module_title}")
        if module_description:
            lines.append(f"   Описание: {module_description}")

        lessons = module.get("lessons", [])
        for j, lesson in enumerate(lessons, start=1):
            lesson_title = lesson.get("title", f"Урок {j}")
            lesson_type = lesson.get("type", "")
            lines.append(f"   {i}.{j}. Урок: {lesson_title} (Тип: {lesson_type})")

            tasks = lesson.get("tasks", [])
            for k, task in enumerate(tasks, start=1):
                task_question = task.get("question") or task.get("title") or f"Задание {k}"
                lines.append(f"      {i}.{j}.{k}. Задание: {task_question}")

        lines.append("")

    return "\n".join(lines)


# --- зависимость: минутный лимит + дневная квота ---
"""
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
"""
# отправка запроса чатику
@router.post("/send", response_model=ChatResponse)
async def chat(
    chat_data: ChatRequest,                      # тело запроса
    #ы_rl: None = Depends(chat_rate_limit_dep),   # лимиты (выполняется ДО логики)
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

        # --- ответ от LLM ---
        raw = await openai_chat(messages)
        # raw может быть строкой, dict с reply/planDraft, dict в виде ответа OpenAI (choices[0].message.content)
        content_text: str = ""
        plan_draft: dict | None = None
        plan_id = None
        plan_status_value: str | None = None

        if isinstance(raw, dict) and ("reply" in raw or "planDraft" in raw):
            # уже распарсили в utils
            content_text = str(raw.get("reply") or "")
            plan_draft = raw.get("planDraft")
        elif isinstance(raw, dict) and "choices" in raw:
            try:
                content_text = raw["choices"][0]["message"]["content"]
            except Exception:
                content_text = ""
        elif isinstance(raw, str):
            content_text = raw
        else:
            # на всякий случай
            content_text = str(raw)

        print("🔥 LLM content:", content_text)

        # если модель вернула JSON текстом — вытащим
        parsed = _extract_first_json(content_text)
        if isinstance(parsed, dict):
            # если внутри есть наши ключи — используем их
            if "reply" in parsed or "planDraft" in parsed:
                content_text = str(parsed.get("reply") or content_text)
                plan_draft = parsed.get("planDraft", plan_draft)

        # если planDraft неожиданно строкой — парсим
        if isinstance(plan_draft, str):
            try:
                plan_draft = json.loads(plan_draft)
            except Exception:
                plan_draft = None

        # убираем выброс 502 при пустом content_text, делаем fallback
        content_text = content_text or "Извини, я не смог составить план."

        print("🧩 Parsed planDraft:", plan_draft)

        # --- создаём план и вложенные сущности, если пришёл planDraft с модулями ---
        modules = plan_draft.get("modules") if isinstance(plan_draft, dict) else None
        if isinstance(plan_draft, dict) and isinstance(modules, list) and modules:
            title = str(plan_draft.get("title") or "Untitled Plan")
            description = str(plan_draft.get("description") or "")

            # 1) сам план
            new_plan = LearningPlan(
                title=title,
                description=description,
                mentor_id=chat_data.mentor_id,
                user_id=current_user.id,
            )
            db.add(new_plan)
            db.flush()  # получить id без коммита

            # 2) модули
            for module_idx, module_data in enumerate(modules):
                if not isinstance(module_data, dict):
                    continue

                module_title = str(module_data.get("title") or f"Модуль {module_idx+1}")
                module_description = str(module_data.get("description") or "")

                module = Module(
                    title=module_title,
                    description=module_description,
                    plan_id=new_plan.id,
                    order_index=module_idx,
                )
                db.add(module)
                db.flush()

                lessons = module_data.get("lessons", [])
                if not isinstance(lessons, list):
                    lessons = []

                # 3) уроки
                for lesson_idx, lesson_data in enumerate(lessons):
                    if not isinstance(lesson_data, dict):
                        continue

                    lesson_title = str(lesson_data.get("title") or f"Урок {lesson_idx+1}")
                    lesson_type = str(lesson_data.get("type") or "theory")

                    lesson_content = lesson_data.get("content") or {}
                    if not isinstance(lesson_content, dict):
                        lesson_content = {"text": str(lesson_content)}

                    lesson = Lesson(
                        title=lesson_title,
                        type=lesson_type,
                        content=lesson_content,
                        module_id=module.id,
                        order_index=lesson_idx,
                    )
                    db.add(lesson)
                    db.flush()

                    tasks = lesson_data.get("tasks", [])
                    if not isinstance(tasks, list):
                        tasks = []

                    # 4) задания
                    for task_idx, task_data in enumerate(tasks):
                        if not isinstance(task_data, dict):
                            continue

                        task_question = str(task_data.get("question") or task_data.get("title") or f"Задание {task_idx+1}")
                        task_type = str(task_data.get("type") or "text")
                        task_options = task_data.get("options") or []
                        if not isinstance(task_options, list):
                            task_options = []
                        task_answer = task_data.get("answer")

                        task = Task(
                            question=task_question,
                            type=task_type,
                            options=task_options,
                            answer=task_answer,
                            lesson_id=lesson.id,
                            order_index=task_idx,
                        )
                        db.add(task)

            db.commit()
            db.refresh(new_plan)
            plan_id = new_plan.id
            plan_status_value = new_plan.status
            print("✅ Plan created with nested items:", plan_id)

        # сохраняем в БД (в чат кладем уже нормальные данные)
        new_message = ChatMessage(
            user_id=current_user.id,
            mentor_id=chat_data.mentor_id,
            prompt=chat_data.prompt,
            response=content_text,
            plan_id=plan_id,
            plan_snapshot=plan_draft if isinstance(plan_draft, dict) else None,
        )
        db.add(new_message)
        db.commit()

        formatted_plan = _format_plan_for_chat(plan_draft) if plan_draft and plan_id else content_text

        return {
            "response": formatted_plan,
            "planDraft": plan_draft or None,
            "plan_id": str(plan_id) if plan_id else None,
            "plan_status": plan_status_value,
        }
    except HTTPException:
        db.rollback()
        raise
    except Exception as e:
        db.rollback()
        print("💥 Ошибка в /chat/send:", str(e))
        traceback.print_exc()
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
        "avatar_url": m.avatar_url,   # ← добавляем
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

    plan_ids = [msg.plan_id for msg in messages if msg.plan_id is not None]

    plan_status_map: dict[UUID, str] = {}
    if plan_ids:
        plan_rows = (
            db.query(LearningPlan.id, LearningPlan.status)
            .filter(LearningPlan.id.in_(plan_ids))
            .all()
        )
        plan_status_map = {row[0]: row[1] for row in plan_rows}

    history = []
    for msg in messages:
        raw_status = None
        if msg.plan_id:
            raw_status = plan_status_map.get(msg.plan_id)
            if raw_status is None:
                raw_status = "deleted"

        history.append(
            {
                "id": str(msg.id),
                "prompt": msg.prompt,
                "response": msg.response,
                "created_at": msg.created_at.isoformat(),
                "plan_id": str(msg.plan_id) if msg.plan_id else None,
                "plan_snapshot": msg.plan_snapshot,
                "plan_status": raw_status,
            }
        )

    return history
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
