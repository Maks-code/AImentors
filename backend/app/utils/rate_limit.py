# app/utils/rate_limit.py
# ----------------------------------------------------------
# Минутный rate limit (скользящее окно на ZSET) + суточная квота.
# Возвращают осмысленные 429 с detail.code, чтобы фронт мог
# показать понятные сообщения пользователю.
# ----------------------------------------------------------
import time
import datetime as dt
from fastapi import Request, HTTPException
from app.core.redis import RedisClient


def _id_from_request(request: Request) -> str:
    """Идентификатор для лимитов: user_id если есть, иначе IP."""
    user = getattr(request.state, "user", None)
    user_id = getattr(user, "id", None)
    if user_id:
        return str(user_id)
    return request.client.host if request.client else "unknown"


def _key(*parts: str) -> str:
    return "aim:" + ":".join(parts)


async def rate_limit(
    request: Request,
    limit: int,
    window: int,
    bucket_prefix: str,
) -> None:
    """
    Скользящее окно на ZSET. Если превышено — 429 с detail.code="RATE_LIMIT_MINUTE".
    Также добавляем Retry-After в секундах.
    """
    identifier = _id_from_request(request)
    key = _key("rate", bucket_prefix, identifier)

    now = int(time.time())
    start = now - window

    r = RedisClient.get()
    pipe = r.pipeline()
    # 1) чистим старые события из окна
    pipe.zremrangebyscore(key, 0, start)
    # 2) добавляем текущее событие
    pipe.zadd(key, {str(now): now})
    # 3) считаем событий
    pipe.zcard(key)
    # 4) выставляем TTL
    pipe.expire(key, window)
    _, _, count, _ = await pipe.execute()

    if count > limit:
        # определим минимальный timestamp в окне, чтобы посчитать Retry-After
        oldest = await r.zrange(key, 0, 0, withscores=True)
        retry_after = 1
        if oldest:
            oldest_ts = int(oldest[0][1])
            retry_after = max(1, window - (now - oldest_ts))
        raise HTTPException(
            status_code=429,
            detail={
                "code": "RATE_LIMIT_MINUTE",
                "message": "Подожди, учитель готовит ответ",
                "retry_after": retry_after,
            },
            headers={"Retry-After": str(retry_after)},
        )


async def enforce_daily_quota(
    request: Request,
    limit: int,
    bucket_prefix: str,
) -> None:
    """
    Суточная квота на кол-во сообщений. Если превышено — 429 с detail.code="RATE_LIMIT_DAILY".
    Ключ: aim:quota:day:<bucket_prefix>:<id>:YYYYMMDD (UTC).
    TTL ставим до конца суток, чтобы ключ сам обнулялся.
    """
    identifier = _id_from_request(request)
    today = dt.datetime.utcnow().strftime("%Y%m%d")
    key = _key("quota", "day", bucket_prefix, identifier, today)

    r = RedisClient.get()
    # Вычислим, сколько секунд осталось до конца суток UTC
    now = dt.datetime.utcnow()
    end_of_day = (now + dt.timedelta(days=1)).replace(hour=0, minute=0, second=0, microsecond=0)
    ttl = int((end_of_day - now).total_seconds()) or 1

    # Увеличиваем счётчик и выставляем TTL, если ключ новый/без TTL
    pipe = r.pipeline()
    pipe.incr(key)
    pipe.ttl(key)
    new_count, current_ttl = await pipe.execute()

    if current_ttl in (-2, -1):  # -2 нет ключа, -1 нет TTL
        await r.expire(key, ttl)

    if new_count > limit:
        raise HTTPException(
            status_code=429,
            detail={
                "code": "RATE_LIMIT_DAILY",
                "message": "Ваш дневной лимит закончился",
            },
        )