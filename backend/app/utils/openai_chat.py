import os
import httpx
import json
from typing import Any
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
OPENAI_MODEL = "gpt-3.5-turbo"

async def openai_chat(messages: list[dict[str, Any]]) -> dict[str, Any]:
    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": OPENAI_MODEL,
        "messages": messages
    }

    print("🔥 Sending payload:", payload)

    import asyncio
    max_attempts = 3
    delays = [1, 2, 4]
    last_exc = None
    for attempt in range(max_attempts):
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    "https://api.openai.com/v1/chat/completions",
                    headers=headers,
                    json=payload,
                    timeout=60.0  # <-- вот здесь таймаут в секундах
                )
            break
        except (httpx.ReadTimeout, httpx.ConnectTimeout) as exc:
            last_exc = exc
            if attempt < max_attempts - 1:
                await asyncio.sleep(delays[attempt])
            else:
                raise
        except Exception:
            raise

    print("🔥 Raw response:", response.text)

    response.raise_for_status()
    content = response.json()["choices"][0]["message"]["content"]

    # Пытаемся вытащить JSON-план
    planDraft = None
    try:
        planDraft = json.loads(content)
    except Exception:
        pass

    return {
        "reply": content,
        "planDraft": planDraft
    }