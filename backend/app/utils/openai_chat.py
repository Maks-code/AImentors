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

    async with httpx.AsyncClient() as client:
        response = await client.post(
            "https://api.openai.com/v1/chat/completions",
            headers=headers,
            json=payload
        )

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