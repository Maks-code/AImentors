# Генерация и проверка токенов (JWT), чтобы понять, 
# кто отправил запрос и можно ли ему доверять

from jose import JWTError, jwt
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
import os
from dotenv import load_dotenv


load_dotenv()

SECRET_KEY: str = os.getenv("SECRET_KEY") or ""
ALGORITHM: str = os.getenv("ALGORITHM") or "HS256"
if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY not set")
if not ALGORITHM:
    raise RuntimeError("ALGORITHM not set")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

class TokenData(BaseModel):
    sub: str
    email: str

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        user = db.query(User).filter(User.id == user_id).first()
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
