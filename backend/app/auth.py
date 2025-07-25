# app/auth.py

import os
import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "")

router = APIRouter(prefix="/auth", tags=["Auth"])

# Модель для запроса
class AuthRequest(BaseModel):
    email: EmailStr
    password: str


@router.post("/signup")
def signup(data: AuthRequest):
    url = f"{SUPABASE_URL}/auth/v1/signup"
    headers = {
        "apikey": SUPABASE_KEY,
        "Content-Type": "application/json"
    }

    payload = {
        "email": data.email,
        "password": data.password
    }

    print("📦 Payload being sent to Supabase:", payload)  # ← ВОТ ЗДЕСЬ

    response = httpx.post(url, json=payload, headers=headers)

    if response.status_code != 200:
        print("❌ Supabase responded with error:", response.status_code, response.text)
        raise HTTPException(status_code=response.status_code, detail=response.json())

    return {
        "status": "registered",
        "user": response.json()
    }


@router.post("/login")
def login(data: AuthRequest):
    url = f"{SUPABASE_URL}/auth/v1/token?grant_type=password"
    headers = {
        "apikey": SUPABASE_KEY,
        "Content-Type": "application/json"
    }
    payload = {
        "email": data.email,
        "password": data.password
    }

    response = httpx.post(url, json=payload, headers=headers)

    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail=response.json())

    return {
        "status": "authenticated",
        "access_token": response.json().get("access_token"),
        "refresh_token": response.json().get("refresh_token"),
        "user": response.json().get("user")
    }

