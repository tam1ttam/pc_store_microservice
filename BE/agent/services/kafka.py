"""Kafka consumer/producer for ai-service.

Consumer : chat-messages-topic  → receives user messages from chat-service
Producer : ai-replies-topic     → sends AI replies back to chat-service
"""
import json
import logging
import os
import threading
from typing import Callable, Optional

from confluent_kafka import Consumer, Producer

logger = logging.getLogger("ai-agent.kafka")

BOOTSTRAP = os.getenv("KAFKA_BOOTSTRAP_SERVERS", "localhost:9094")
CHAT_TOPIC = os.getenv("KAFKA_CHAT_MESSAGES_TOPIC", "chat-messages")
REPLY_TOPIC = os.getenv("KAFKA_AI_REPLIES_TOPIC", "ai-replies")
CONSUMER_GROUP = os.getenv("KAFKA_CONSUMER_GROUP", "ai-agent-group")


def _build_producer() -> Producer:
    return Producer({"bootstrap.servers": BOOTSTRAP})


def _build_consumer() -> Consumer:
    return Consumer(
        {
            "bootstrap.servers": BOOTSTRAP,
            "group.id": CONSUMER_GROUP,
            "auto.offset.reset": "latest",
            "enable.auto.commit": True,
        }
    )


def start_kafka_consumer() -> "_KafkaConsumerTask":
    task = _KafkaConsumerTask()
    task.start()
    return task


class _KafkaConsumerTask:
    def __init__(self) -> None:
        self._handler: Optional[Callable[[dict], None]] = None
        self._thread: Optional[threading.Thread] = None
        self._stop_event = threading.Event()

    def set_handler(self, handler: Callable[[dict], None]) -> None:
        self._handler = handler

    def start(self) -> None:
        if self._thread and self._thread.is_alive():
            return
        self._stop_event.clear()
        self._thread = threading.Thread(target=self._run, daemon=True)
        self._thread.start()
        logger.info("Kafka consumer thread started (topic=%s, group=%s)", CHAT_TOPIC, CONSUMER_GROUP)

    def stop(self) -> None:
        self._stop_event.set()
        if self._thread:
            self._thread.join(timeout=5)

    def _run(self) -> None:
        consumer = _build_consumer()
        consumer.subscribe([CHAT_TOPIC])
        logger.info("Subscribed to topic=%s", CHAT_TOPIC)

        while not self._stop_event.is_set():
            msg = consumer.poll(1.0)
            if msg is None:
                continue
            if msg.error():
                logger.error("Kafka error: %s", msg.error())
                continue
            try:
                payload = json.loads(msg.value().decode("utf-8"))
                logger.info(
                    "Received: conversation_id=%s type=%s",
                    payload.get("conversation_id"),
                    payload.get("message_type", "TEXT"),
                )
                if self._handler:
                    self._handler(payload)
            except Exception as exc:
                logger.exception("Failed to process Kafka message: %s", exc)

        consumer.close()
        logger.info("Kafka consumer closed")


def produce_ai_reply(
    conversation_id: str,
    user_id: str,
    message: str,
    message_type: str = "TEXT",
    product_card: Optional[dict] = None,
) -> None:
    producer = _build_producer()
    payload = {
        "conversation_id": conversation_id,
        "user_id": user_id,
        "message": message,
        "message_type": message_type,
        "sender": "ai",
        "sender_name": "AI Assistant",
    }
    if product_card:
        payload["product_card"] = product_card

    def _delivery(err, msg):  # noqa: ANN001
        if err:
            logger.error("Failed to produce ai-reply: %s", err)

    try:
        producer.produce(REPLY_TOPIC, value=json.dumps(payload).encode("utf-8"), callback=_delivery)
        producer.flush(timeout=5)
        logger.info("Produced ai-reply for conversation_id=%s", conversation_id)
    except Exception as exc:
        logger.exception("Failed to produce ai-reply: %s", exc)
