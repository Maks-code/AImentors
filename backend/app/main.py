# backend/app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.errors import http_exception_handler, validation_exception_handler
from app.core.redis import RedisClient
from app.core.config import settings
from fastapi.middleware.cors import CORSMiddleware
# роутеры
from app.routers import auth, chat, mentors
from app.routers.health import router as health_router  # <-- ИМЕННО ТАК, импортируем router

app = FastAPI(
    title="AI Mentors API",
    description="API для регистрации, авторизации, профилей и чатов",
    version="0.1.0",
)

# Обработчики ошибок
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Это разрешит все домены (для разработки можно использовать это)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Подключение Redis через единый клиент
@app.on_event("startup")
async def _startup():
    ok = await RedisClient.ping()
    if not ok:
        print("[REDIS] ping failed")

@app.on_event("shutdown")
async def _shutdown():
    await RedisClient.close()

# Роутеры
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(chat.router, prefix="/chat", tags=["chat"])
app.include_router(mentors.router, prefix="/mentors", tags=["mentors"])
app.include_router(health_router)  # /health и /health/deep приходят отсюда