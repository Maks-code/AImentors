import asyncio
import redis.asyncio as redis
from typing import Optional
from .config import settings

class RedisClient:
    _client: Optional[redis.Redis] = None

    @classmethod
    def get(cls) -> redis.Redis:
        if cls._client is None:
            cls._client = redis.from_url(
                str(settings.REDIS_URL),
                decode_responses=True,
                socket_timeout=2.0,          # таймауты на сеть
                socket_connect_timeout=2.0,
                retry_on_timeout=True,
            )
        return cls._client

    @classmethod
    async def ping(cls) -> bool:
        r = cls.get()
        try:
            return await r.ping()
        except Exception:
            return False

    @classmethod
    async def close(cls):
        if cls._client:
            await cls._client.close()
            cls._client = None