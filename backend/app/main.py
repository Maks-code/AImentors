# Главный файл. Запускает сервер и 
# подключает все роуты (типа /register, /me и т.д.)

# backend/app/main.py

from fastapi import FastAPI
from app.routers import auth
from app.routers import chat
from app.routers import mentors
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="AI Mentors API",
    description="API для регистрации, авторизации и профилей",
    version="0.1.0"
)

app.include_router(auth.router)
app.include_router(chat.router, prefix="/chat", tags=["chat"])
app.include_router(mentors.router)
app.include_router(auth.router, prefix="/auth", tags=["auth"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # твой фронт
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)