"""ai_chat_history.py — CRUD over MongoDB collection `ai_chat_histories`.

One document per conversation_id.  Persists to chat-service MongoDB so
ai-service history survives restarts and can be queried by user_id.
"""
from __future__ import annotations

import logging
import time
from typing import Any

from services.mongo import get_db

logger = logging.getLogger("ai-agent.chat_history")

_COLLECTION = "ai_chat_histories"
_HISTORY_LIMIT = 100


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

    # Move user_id into $set so it always gets refreshed (handles the case
    # where the doc was first upserted with an empty user_id from the Kafka path).
    update: dict[str, Any] = {
        "$setOnInsert": {
            "conversationId": conversation_id,
            "createdAt": now,
        },
        "$set": {
            "userId": user_id,
            "updatedAt": now,
        },
        "$push": {
            "messages": {
                "role": role,
                "content": content,
                "createdAt": now,
            }
        },
    }
    if metadata:
        update["$set"]["metadata"] = metadata
    elif model:
        update["$set"]["metadata"] = {"model": model}

    try:
        coll.update_one(
            {"conversationId": conversation_id},
            update,
            upsert=True,
        )
        logger.debug(
            "Saved message: conv=%s role=%s user=%s src=%s",
            conversation_id,
            role,
            user_id,
            source,
        )
    except Exception:
        logger.exception("save_message failed: conv=%s", conversation_id)


def get_history(
    conversation_id: str,
    limit: int = _HISTORY_LIMIT,
) -> list[dict[str, str]]:
    db = get_db()
    coll = db[_COLLECTION]
    doc = coll.find_one(
        {"conversationId": conversation_id},
        {"messages": {"$slice": -limit}},
    )
    if not doc:
        return []
    return [
        {"role": m["role"], "content": m["content"]}
        for m in doc.get("messages", [])
    ]


def get_recent(conversation_id: str, limit: int = 20) -> list[dict[str, str]]:
    return get_history(conversation_id, limit=limit)


def list_conversations(
    user_id: str,
    *,
    limit: int = 50,
) -> list[dict[str, Any]]:
    db = get_db()
    coll = db[_COLLECTION]
    # NOTE: pymongo Cursor does NOT have .projection(); pass projection into find().
    cursor = coll.find(
        {"userId": user_id},
        {
            "conversationId": 1,
            "userId": 1,
            "updatedAt": 1,
            "createdAt": 1,
            "messages": {"$slice": -1},
        },
    ).sort("updatedAt", -1).limit(limit)

    results: list[dict[str, Any]] = []
    for doc in cursor:
        preview = ""
        if doc.get("messages"):
            last = doc["messages"][0]
            preview = (last.get("content") or "")[:120]
        results.append(
            {
                "conversationId": doc["conversationId"],
                "userId": doc.get("userId"),
                "lastMessage": preview,
                "updatedAt": doc.get("updatedAt"),
                "createdAt": doc.get("createdAt"),
            }
        )
    return results
