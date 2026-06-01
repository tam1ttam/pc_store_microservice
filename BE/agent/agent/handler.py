"""handler.py — Kafka message handler for ai-service.

Receives messages from chat-messages-topic, runs the LangChain agent,
and produces the AI reply to ai-replies-topic.

History is stored in MongoDB (source of truth) with an in-memory cache
for the current session to avoid round-trips on every turn.
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
        cached = _conversation_history.get(conversation_id)
        if cached is not None:
            return list(cached)
    try:
        from services.ai_chat_history import get_recent
        rows = get_recent(conversation_id, limit=_HISTORY_MAX)
        if rows:
            with _history_lock:
                _conversation_history[conversation_id] = deque(
                    rows, maxlen=_HISTORY_MAX
                )
            return rows
    except Exception:
        logger.exception("Mongo history load failed for conv=%s", conversation_id)
    return []


def _append_history(conversation_id: str, role: str, content: str, user_id: str = "") -> None:
    with _history_lock:
        dq = _conversation_history.setdefault(
            conversation_id, deque(maxlen=_HISTORY_MAX)
        )
        dq.append({"role": role, "content": content})
    if not user_id:
        return
    try:
        from services.ai_chat_history import save_message
        save_message(conversation_id, user_id, role, content, source="kafka")
    except Exception:
        logger.exception("Mongo history save failed for conv=%s", conversation_id)


class AgentHandler:
    def __init__(self) -> None:
        self._agent: Optional[Any] = None

    def _get_history(self, conversation_id: str):
        return _get_history(conversation_id)

    def _append_history(self, conversation_id: str, role: str, content: str):
        _append_history(conversation_id, role, content)

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

        logger.info(
            "Processing: conv=%s user=%s type=%s",
            conversation_id,
            user_id,
            message_type,
        )

        _append_history(conversation_id, "user", user_message, user_id=user_id)

        if message_type == "PRODUCT_CARD":
            ai_text = self._reply_for_product_card(user_id, payload)
        else:
            agent = self._get_agent()
            agent.user_id = user_id
            agent.conversation_id = conversation_id
            history = _get_history(conversation_id)
            ai_text = agent.chat(user_message, history=history)

        _append_history(conversation_id, "assistant", ai_text, user_id=user_id)
        self._send_reply(conversation_id, user_id, ai_text)

    def _reply_for_product_card(self, user_id: str, payload: dict) -> str:
        card = payload.get("product_card") or {}
        product_id = card.get("productId") or card.get("product_id")
        name = card.get("name", "sản phẩm này")

        if not product_id:
            return (
                f"Bạn quan tâm đến {name}. Tôi có thể giúp tìm thông tin chi tiết "
                "hoặc thêm vào giỏ hàng cho bạn."
            )

        try:
            from services.product_client import get_product_detail, get_remaining_stock
            detail = get_product_detail(product_id)
            stock = get_remaining_stock(product_id)
            stock_label = {
                -1: "không rõ",
                0: "hết hàng",
                1: "còn rất ít",
            }.get(stock, f"còn {stock}") if isinstance(stock, int) else "không rõ"

            desc = ""
            if detail.get("description"):
                desc = f"\n{detail.get('description')}"
            return (
                f"📦 {detail.get('name', name)}\n"
                f"💰 {detail.get('price', 0):,.0f}₫\n"
                f"📊 Tồn kho: {stock_label}\n"
                f"{desc}"
                "\nBạn muốn tôi thêm vào giỏ hàng không?"
            )
        except Exception:
            logger.exception("product card reply failed")
            return (
                f"Bạn quan tâm đến {name}. Bạn muốn tôi tìm thông tin chi tiết "
                "hoặc thêm vào giỏ hàng không?"
            )

    def _send_reply(self, conversation_id: str, user_id: str, text: str) -> None:
        from services.kafka import produce_ai_reply
        produce_ai_reply(conversation_id, user_id, text)
