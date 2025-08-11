# Тут ручки (эндпоинты) для работы с пользователем: 
# регистрация, логин, обновление профиля, смена пароля и подтверждение почты

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from jose import jwt
import uuid
import os
from dotenv import load_dotenv

from app.schemas.user import UserCreate, UserLogin
from app.database import SessionLocal
from app.models.user import User

# Загрузка переменных окружения
load_dotenv()

# Явные переменные с аннотацией типов
SECRET_KEY: str = os.getenv("SECRET_KEY") or ""
ALGORITHM: str = os.getenv("ALGORITHM") or "HS256"

if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY is not set in .env")

if not ALGORITHM:
    raise RuntimeError("ALGORITHM is not set in .env")

# Инициализация шифровальщика
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
router = APIRouter()


# Подключение к БД
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.post("/register")
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")

    hashed_password = pwd_context.hash(user_data.password) # хэшируем пароль чтобы он не отображался в БД
    new_user = User(
        id=str(uuid.uuid4()),
        email=user_data.email,
        hashed_password=hashed_password,
        full_name=user_data.full_name,
        bio=user_data.bio,
        role="student"  # пока по умолчанию
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    from app.utils.email_verification import generate_verification_token
    from app.utils.mail import send_verification_email

    token = generate_verification_token(str(new_user.id))
    verify_url = f"http://127.0.0.1:8000/verify-email?token={token}"

    try:
        await send_verification_email(new_user.email, verify_url)
    except Exception as e:
        print("❌ Email verification send failed:", e)

    return {"message": "User created", "user_id": new_user.id}


@router.post("/login")
def login(user_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == user_data.email).first()

    if user is None:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not user.is_verified:
        raise HTTPException(status_code=403, detail="Email not verified")

    hashed_pw: str = getattr(user, "hashed_password")
    if not pwd_context.verify(user_data.password, hashed_pw):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token_data = {
        "sub": str(user.id),
        "email": user.email
    }

    token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)
    return {"access_token": token, "token_type": "bearer"}

from app.auth.jwt_handler import get_current_user, TokenData


# Ручка для получения инфы по текущему пользователю 
# (у него в профиле его инфа из БД будет отображаться)
@router.get("/me")
def read_current_user(
    current_user: User = Depends(get_current_user),  # ✅ получаем User
):
    return {
        "id": current_user.id,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "bio": current_user.bio,
        "role": current_user.role,
        "created_at": current_user.created_at,
        "avatar_url": current_user.avatar_url, 
    }

## Ручка для обновления данных пользователя
from app.schemas.user import UserUpdate

@router.patch("/me")
def update_user(
    update_data: UserUpdate,
    current_user: User = Depends(get_current_user),  # ✅ здесь
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == current_user.id).first()  # ✅ и здесь

    if user is None:
        raise HTTPException(status_code=404, detail="User not found")

    if update_data.full_name is not None:
        user.full_name = update_data.full_name

    if update_data.bio is not None:
        user.bio = update_data.bio

    if update_data.avatar_url is not None:  # ✅ добавим сюда обновление аватара
        user.avatar_url = update_data.avatar_url

    db.commit()
    db.refresh(user)

    return {
        "message": "Profile updated",
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "bio": user.bio,
            "role": user.role,
            "avatar_url": user.avatar_url
        }
    }


from app.schemas.user import UserPasswordUpdate

@router.patch("/me/password")
def update_password(
    data: UserPasswordUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not pwd_context.verify(data.old_password, current_user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect old password")

    # Хешируем новый пароль
    new_hashed = pwd_context.hash(data.new_password)

    # Прямое обновление в базе
    db.query(User).filter(User.id == current_user.id).update(
        {"hashed_password": new_hashed}
    )
    db.commit()

    return {"message": "Password updated successfully"}

from app.schemas.user import PasswordResetRequest
from app.utils.mail import send_reset_email  # наш модуль отправки писем

@router.post("/reset-password-request")
async def reset_password_request(
    data: PasswordResetRequest,
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    # генерируем JWT с коротким сроком жизни (например, 15 мин)
    token_data = {"sub": user.id, "email": user.email}
    reset_token = jwt.encode(token_data, SECRET_KEY, algorithm=ALGORITHM)

    # строим ссылку
    reset_link = f"http://localhost:3000/reset-password?token={reset_token}"  # подставим позже frontend ссылку

    try:
        await send_reset_email(user.email, reset_link)
    except Exception as e:
        print("❌ Email send failed:", e)
        raise HTTPException(status_code=500, detail="Failed to send email")

    return {"message": "Password reset link sent"}


from fastapi import Request
from app.utils.email_verification import verify_token

@router.get("/verify-email")
def verify_email(token: str, db: Session = Depends(get_db)):
    try:
        user_id = verify_token(token)
        user = db.query(User).filter(User.id == user_id).first()

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        user.is_verified = True
        db.commit()

        return {"message": "Email подтверждён!"}

    except Exception as e:
        raise HTTPException(status_code=400, detail="Invalid or expired token")