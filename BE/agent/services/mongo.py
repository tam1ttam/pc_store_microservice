"""mongo.py — lazy singleton MongoDB client for ai-service.

Reuses chat-service DB (database name: chat-service) so we do not spin up
a separate database.  URI is configurable via AI_MONGO_URI env var.
"""
import logging
import os
from typing import Optional

from pymongo import MongoClient
from pymongo.database import Database

logger = logging.getLogger("ai-agent.mongo")

_AI_MONGO_URI = os.getenv(
    "AI_MONGO_URI",
    "mongodb://root:123456@localhost:6000/chat-service?authSource=admin",
)
_AI_MONGO_DB = os.getenv("AI_MONGO_DB", "chat-service")

_client: Optional[MongoClient] = None
_db: Optional[Database] = None


def get_db() -> Database:
    global _client, _db
    if _db is None:
        _client = MongoClient(
            _AI_MONGO_URI,
            serverSelectionTimeoutMS=3000,
            connectTimeoutMS=3000,
        )
        _db = _client[_AI_MONGO_DB]
        logger.info("Connected to MongoDB db=%s uri=%s", _AI_MONGO_DB, _AI_MONGO_URI)
    return _db
