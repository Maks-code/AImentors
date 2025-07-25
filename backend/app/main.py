from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, EmailStr
from .supabase_client import supabase
from .auth import router as auth_router

app = FastAPI()
app.include_router(auth_router)

@app.get("/users")
def get_users():
    response = supabase.table("users1").select("*").execute()
    return response.data

class UserCreate(BaseModel):
    name: str
    email: EmailStr

@app.post("/users")
def create_user(user: UserCreate):
    try:
        existing = supabase.table("users1").select("*").eq("email", user.email).execute()
        if existing.data:
            raise HTTPException(status_code=400, detail="User already exists")

        response = supabase.table("users1").insert({
            "name": user.name,
            "email": user.email.strip()
        }).execute()

        return {"status": "success", "user": response.data[0]}

    except Exception as e:
        print("❌ ERROR inserting user:", e)
        raise HTTPException(status_code=500, detail=str(e))