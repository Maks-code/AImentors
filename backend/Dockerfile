# backend/Dockerfile
FROM python:3.11-slim

WORKDIR /app

# 1) зависимости
COPY requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r /app/requirements.txt

# 2) код приложения
COPY . /app

# 3) запуск
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]