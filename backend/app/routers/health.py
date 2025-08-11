from fastapi import APIRouter
from app.core.redis import RedisClient

router = APIRouter()

@router.get("/health")
async def health():
    return {"ok": True}

@router.get("/health/deep")
async def health_deep():
    redis_ok = await RedisClient.ping()
    return {"ok": redis_ok, "redis": "up" if redis_ok else "down"}