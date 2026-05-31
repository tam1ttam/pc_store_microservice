"""
AI Agent Service — Python FastAPI microservice.
Listens on Kafka (chat-messages-topic) and replies via ai-replies-topic.
"""
import logging
import os
import sys
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Ensure BE/agent is on sys.path so  and  imports work
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
if CURRENT_DIR not in sys.path:
    sys.path.insert(0, CURRENT_DIR)

from services.eureka import register_eureka
from services.kafka import start_kafka_consumer, _KafkaConsumerTask
from agent.handler import AgentHandler

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(name)s - %(message)s',
)
logger = logging.getLogger('ai-agent')

_kafka_task: Optional[_KafkaConsumerTask] = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global _kafka_task
    logger.info('Starting AI Agent Service')

    try:
        register_eureka()
    except Exception as exc:
        logger.warning('Eureka registration failed: %s', exc)

    handler = AgentHandler()
    _kafka_task = start_kafka_consumer()
    _kafka_task.set_handler(handler.handle)

    yield

    logger.info('Shutting down AI Agent Service')
    if _kafka_task:
        _kafka_task.stop()


app = FastAPI(
    title='AI Agent Service',
    version='0.1.0',
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


@app.get('/health')
def health():
    return {'status': 'ok', 'service': 'ai-service'}


@app.get('/')
def root():
    return {'message': 'AI Agent Service is running', 'docs': '/docs'}
