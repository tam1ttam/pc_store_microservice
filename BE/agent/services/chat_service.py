"""chat_service.py — REST calls back to Java chat-service for plain chat replies.

chat-service already has /ai/ask endpoint that calls OpenRouter/Gemini.
We reuse it here so AI agent doesn't duplicate chat logic.
"""
import logging
from typing import Optional

import requests

logger = logging.getLogger("ai-agent.chat")


def plain_chat(user_id: str, message: str, mode: str = "chat") -> str:
    """Delegate plain chat to chat-service /ai/ask.

    Returns the AI text reply, or an error string if the call fails.
    """
    url = f"http://localhost:6060/api-gateway/chat-service/ai/ask"
    payload = {"message": message, "mode": mode}
    headers = {"Content-Type": "application/json"}

    try:
        resp = requests.post(url, json=payload, headers=headers, timeout=30)
        resp.raise_for_status()
        body = resp.json()
        result = body.get("result", {})
        if result.get("success"):
            return result.get("response", "Không có phản hồi.")
        return result.get("error") or "AI hiện không phản hồi được."
    except Exception as exc:
        logger.error("plain_chat failed: %s", exc)
        return "Xin lỗi, tôi gặp lỗi kết nối. Bạn vui lòng thử lại sau."
