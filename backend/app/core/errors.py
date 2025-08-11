from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from pydantic import ValidationError  # из Pydantic v2

def http_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    if isinstance(exc, StarletteHTTPException):
        return JSONResponse(
            status_code=exc.status_code,
            content={"ok": False, "error": {"code": exc.status_code, "message": exc.detail}},
        )
    return JSONResponse(
        status_code=500,
        content={"ok": False, "error": {"code": 500, "message": "Internal server error"}},
    )

def validation_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    if isinstance(exc, (RequestValidationError, ValidationError)):
        return JSONResponse(
            status_code=422,
            content={
                "ok": False,
                "error": {
                    "code": 422,
                    "message": "Validation error",
                    "details": exc.errors(),
                },
            },
        )
    return JSONResponse(
        status_code=500,
        content={"ok": False, "error": {"code": 500, "message": "Internal server error"}},
    )