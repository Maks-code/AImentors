# Главный файл. Запускает сервер и 
# подключает все роуты (типа /register, /me и т.д.)

# backend/app/main.py

from fastapi import FastAPI
from app.routers import auth, ai
from app.routers import chat
from app.routers import mentors

app = FastAPI(
    title="AI Mentors API",
    description="API для регистрации, авторизации и профилей",
    version="0.1.0"
)

app.include_router(auth.router)
app.include_router(ai.router)
app.include_router(chat.router)
app.include_router(mentors.router)