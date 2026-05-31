"""handler.py — Kafka message handler for ai-service.

Receives messages from chat-messages-topic, runs the LangChain agent,
and produces the AI reply to ai-replies-topic.
"""
import logging
import threading
from collections import deque
from typing import Any, Optional

logger = logging.getLogger("ai-agent.handler")

_HISTORY_MAX = 20
_history_lock = threading.Lock()
_conversation_history: dict[str, deque[dict[str, str]]] = {}


def _get_history(conversation_id: str) -> list[dict[str, str]]:
    with _history_lock:
        return list(_conversation_history.get(conversation_id, []))


def _append_history(conversation_id: str, role: str, content: str) -> None:
    with _history_lock:
        dq = _conversation_history.setdefault(conversation_id, deque(maxlen=_HISTORY_MAX))
        dq.append({"role": role, "content": content})


class AgentHandler:
    def __init__(self) -> None:
        self._agent: Optional[Any] = None

    def _get_agent(self):
        if self._agent is None:
            from agent.agent_graph import AIAgent
            self._agent = AIAgent()
        return self._agent

    def handle(self, payload: dict) -> None:
        conversation_id = payload.get("conversation_id")
        user_id = payload.get("user_id", "anonymous")
        user_message = payload.get("message", "")
        message_type = payload.get("message_type", "TEXT")

        if not conversation_id or not user_message:
            logger.warning("Skip empty message: %s", payload)
            return

        logger.info("Processing: conv=%s user=%s type=%s", conversation_id, user_id, message_type)

        _append_history(conversation_id, "user", user_message)

        if message_type == "PRODUCT_CARD":
            ai_text = self._reply_for_product_card(user_id, payload)
        else:
            agent = self._get_agent()
            agent.user_id = user_id
            agent.conversation_id = conversation_id
            history = _get_history(conversation_id)
            ai_text = agent.chat(user_message, history=history)

        _append_history(conversation_id, "assistant", ai_text)
        self._send_reply(conversation_id, user_id, ai_text)

    def _reply_for_product_card(self, user_id: str, payload: dict) -> str:
        card = payload.get("product_card") or {}
        product_id = card.get("productId") or card.get("product_id")
        name = card.get("name", "sản phẩm này")

        if not product_id:
            return f"Bạn quan tâm đến {name}. Tôi có thể giúp tìm thông tin chi tiết hoặc thêm vào giỏ hàng cho bạn."

        try:
            from services.product_client import get_product_detail, get_remaining_stock
            detail = get_product_detail(product_id)
            stock = get_remaining_stock(product_id)
            stock_label = {
                -1: "không rõ", 0: "hết hàng", 1: "còn rất ít",
            }.get(stock, f"còn {stock}") if isinstance(stock, int) else "không rõ"

            desc = ""
            if detail.get("description"):
                desc = f"\n{detail.get('description')}"
            return (
                f"📦 {detail.get('name', name)}\n"
                f"💰 {detail.get('price', 0):,.0f}₫\n"
                f"📊 Tồn kho: {stock_label}\n"
                f"{desc}"
                f"\nBạn muốn tôi thêm vào giỏ hàng không?"
            )
        except Exception as exc:
            logger.error("product card reply failed: %s", exc)
            return f"Bạn quan tâm đến {name}. Bạn muốn tôi tìm thông tin chi tiết hoặc thêm vào giỏ hàng không?"

    def _send_reply(self, conversation_id: str, user_id: str, text: str) -> None:
        from services.kafka import produce_ai_reply
        produce_ai_reply(conversation_id, user_id, text)
