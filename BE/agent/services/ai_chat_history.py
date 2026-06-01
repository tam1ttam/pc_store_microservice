"""ai_chat_history.py — CRUD over MongoDB collection `ai_chat_histories`.

One document per conversation_id.
"""
from __future__ import annotations

import logging
import time
from typing import Any

from services.mongo import get_db

logger = logging.getLogger("ai-agent.chat_history")

_COLLECTION = "ai_chat_histories"
_LIMIT = 100


def _now() -> float:
    return time.time()


def save_message(
    conversation_id: str,
    user_id: str,
    role: str,
    content: str,
    *,
    source: str = "rest",
    model: str | None = None,
    metadata: dict[str, Any] | None = None,
) -> None:
    db = get_db()
    coll = db[_COLLECTION]
    now = _now()
    update: dict[str, Any] = {
        "$setOnInsert": {
            "conversation_id": conversation_id,
            "user_id": user_id,
            "created_at": now,
        },
        "$set": {"updated_at": now},
        "$push": {
            "messages": {
                "role": role,
                "content": content,
                "created_at": now,
            }
        },
    }
    if metadata:
        update["$set"]["metadata"] = metadata
    if model:
        update["$set"]["metadata.model"] = model
    try:
        coll.update_one(
            {"conversation_id": conversation_id},
            update,
            upsert=True,
        )
        logger.debug("Saved message: conv=%s role=%s src=%s", conversation_id, role, source)
    except Exception:
        logger.exception("save_message failed: conv=%s", conversation_id)


def get_history(
    conversation_id: str,
    limit: int = _LIMIT,
) -> list[dict[str, Any]]:
    db = get_db()
    coll = db[_COLLECTION]
    doc = coll.find_one(
        {"conversation_id": conversation_id},
        {"messages": {"$slice": -limit}},
    )
    if not doc:
        return []
    return [{"role": m["role"], "content": m["content"]} for m in doc.get("messages", [])]


def get_recent(conversation_id: str, limit: int = 20) -> list[dict[str, Any]]:
    return get_history(conversation_id, limit=limit)


def list_conversations(user_id: str, *, limit: int = 50) -> list[dict[str, Any]]:
    db = get_db()
    coll = db[_COLLECTION]
    cursor = (
        coll.find({"user_id": user_id})
        .sort("updated_at", -1)
        .limit(limit)
        .projection(
            {
                "conversation_id": 1,
                "updated_at": 1,
                "created_at": 1,
                "messages": {"$slice": -1},
            }
        )
    )
    results: list[dict[str, Any]] = []
    for doc in cursor:
        preview = ""
        if doc.get("messages"):
            last = doc["messages"][0]
            preview = (last.get("content") or "")[:120]
        results.append(
            {
                "conversationId": doc["conversation_id"],
                "userId": doc["user_id"],
                "lastMessage": preview,
                "updatedAt": doc.get("updated_at"),
                "createdAt": doc.get("created_at"),
            }
        )
    return results
