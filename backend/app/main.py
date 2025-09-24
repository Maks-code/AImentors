# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from fastapi.openapi.utils import get_openapi

from app.core.errors import http_exception_handler, validation_exception_handler
from app.core.redis import RedisClient
from app.core.config import settings
from fastapi.middleware.cors import CORSMiddleware

from app.routers import auth, chat, mentors, learning
from app.routers.health import router as health_router  # <-- ИМЕННО ТАК, импортируем router


app = FastAPI(
    title="AI Mentors API",
    description="API для регистрации, авторизации, профилей и чатов",
    version="0.1.0",
)

# Обработчики ошибок
app.add_exception_handler(StarletteHTTPException, http_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Это разрешит все домены (для разработки можно использовать это)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Подключение Redis через единый клиент
@app.on_event("startup")
async def _startup():
    ok = await RedisClient.ping()
    if not ok:
        print("[REDIS] ping failed")

@app.on_event("shutdown")
async def _shutdown():
    await RedisClient.close()

# Роутеры

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(chat.router, prefix="/chat", tags=["chat"])
app.include_router(mentors.router, prefix="/mentors", tags=["mentors"])
app.include_router(health_router)  # /health и /health/deep приходят отсюда
app.include_router(learning.router, tags=["Learning"])

# Custom OpenAPI schema with bearerAuth security scheme
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )
    if "components" not in openapi_schema:
        openapi_schema["components"] = {}
    if "securitySchemes" not in openapi_schema["components"]:
        openapi_schema["components"]["securitySchemes"] = {}
    openapi_schema["components"]["securitySchemes"]["bearerAuth"] = {
        "type": "http",
        "scheme": "bearer",
        "bearerFormat": "JWT",
    }
    # Set default security for all paths/methods
    for path in openapi_schema.get("paths", {}):
        for method in openapi_schema["paths"][path]:
            if "security" not in openapi_schema["paths"][path][method]:
                openapi_schema["paths"][path][method]["security"] = [{"bearerAuth": []}]
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi