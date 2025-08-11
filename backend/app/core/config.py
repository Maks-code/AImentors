from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # Pydantic v2: конфигурация через model_config, а не через class Config
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
    )

    # Общие настройки
    ENV: str = "local"

    # Подключения
    # Используем str (а не AnyUrl), чтобы Pylance не ругался на литерал.
    # Валидацию URL делает сам клиент (redis.from_url / драйверы БД).
    REDIS_URL: str = "redis://redis:6379/0"  # dev по умолчанию внутри docker-compose
    DATABASE_URL: str = ""  # возьми из .env в проде

    # Безопасность / JWT
    SECRET_KEY: SecretStr | None = None
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # Почта для отправки писем
    MAIL_USERNAME: str = ""
    MAIL_PASSWORD: SecretStr | None = None
    MAIL_FROM: str = ""
    MAIL_FROM_NAME: str = "AImentors"
    MAIL_SERVER: str = "smtp.gmail.com"
    MAIL_PORT: int = 587

    # Rate limiting / квоты
    RATE_LIMIT_PER_MIN: int = 5      # максимум сообщений в минуту на пользователя
    RATE_BURST_WINDOW: int = 60      # окно скользящего лимита (сек)
    DAILY_MSG_LIMIT: int = 100       # квота сообщений в сутки на пользователя

    # Интеграции
    OPENAI_API_KEY: SecretStr | None = None


settings = Settings()