# в этом файле мы объявляем схемы ручек в 
# Свэгере где затем дергаем их

from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel): # ручка для реги
    email: EmailStr
    password: str
    full_name: Optional[str] = None
    bio: Optional[str] = None

class UserLogin(BaseModel): # ручка для логина и получения токена
    email: EmailStr
    password: str

class UserUpdate(BaseModel): # ручка для онбволения ФИО и био
    full_name: Optional[str] = None
    bio: Optional[str] = None

class UserPasswordUpdate(BaseModel): # ручка для смены пароля
    old_password: str
    new_password: str

class PasswordResetRequest(BaseModel):
    email: EmailStr

