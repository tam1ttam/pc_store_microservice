"""AI Agent Service - Python FastAPI microservice. Primary entrypoint: REST /chat endpoint called directly by FE via API Gateway. Also listens on Kafka for async events (legacy). """
import logging
import os
import sys
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Optional
from dotenv import load_dotenv
load_dotenv()
print("API KEY:", os.getenv("OPENROUTER_API_KEY", "KHONG TIM THAY"))
from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
CURRENT_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = CURRENT_DIR.parent.parent.parent
load_dotenv(PROJECT_ROOT / ".env", override=False)
from services.eureka import register_eureka_async
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
        register_eureka_async()
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
    version='0.2.0',
    lifespan=lifespan,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)
def _extract_user_id(authorization: Optional[str]) -> str:
    if not authorization:
        return "anonymous"
    if authorization.startswith("Bearer "):
        token = authorization[7:]
    else:
        token = authorization
    if not token:
        return "anonymous"
    try:
        import jwt
        payload = jwt.decode(token, options={"verify_signature": False})
        return payload.get("sub") or payload.get("userId") or "anonymous"
    except Exception:
        return "anonymous"
@app.get('/health')
def health():
    return {'status': 'ok', 'service': 'ai-service'}
@app.get('/')
def root():
    return {'message': 'AI Agent Service is running', 'docs': '/docs'}
@app.post('/chat')
def chat(
    body: dict,
    authorization: Optional[str] = Header(None, convert_underscores=False),
):
    message = body.get('message') or body.get('text') or ''
    conversation_id = body.get('conversationId') or body.get('conversation_id') or 'default'
    userId = body.get('userId') or _extract_user_id(authorization)
    product_card = body.get('productCard') or body.get('product_card')
    message_type = 'PRODUCT_CARD' if product_card else body.get('messageType', 'TEXT')
    if not message and not product_card:
        return {
            'success': True,
            'response': 'Ban can gui tin nhan hoac san pham de toi ho tro nhe!',
            'model': 'template',
        }
    handler = AgentHandler()
    payload = {
        'conversation_id': conversation_id,
        'userId': userId,
        'message': message,
        'message_type': message_type,
    }
    if product_card:
        payload['product_card'] = product_card
    try:
        if message_type == 'PRODUCT_CARD' and product_card:
            reply = handler._reply_for_product_card(userId, payload)
        else:
            agent = handler._get_agent()
            agent.userId = userId
            agent.conversation_id = conversation_id
            history = handler._get_history(conversation_id)
            reply = agent.chat(message, history=history)
        handler._append_history(conversation_id, 'user', message or '[PRODUCT_CARD]')
        handler._append_history(conversation_id, 'assistant', reply)
        try:
            from services.ai_chat_history import save_message
            if message:
                save_message(conversation_id, userId, 'user', message, source='rest')
            save_message(conversation_id, userId, 'assistant', reply, source='rest', model='agent')
        except Exception:
            logger.exception('Mongo save failed for /chat')
        return {
            'success': True,
            'response': reply,
            'model': 'agent',
        }
    except Exception as exc:
        logger.exception('chat failed: %s', exc)
        return {
            'success': False,
            'response': 'Toi dang gap su co. Ban vui long thu lai sau.',
            'error': str(exc),
        }
@app.get('/history')
@app.get('/chat/history')
def get_chat_history(
    authorization: Optional[str] = Header(None, convert_underscores=False),
    userId: Optional[str] = None,
):
    if not userId:
        userId = _extract_user_id(authorization)
    try:
        from services.ai_chat_history import list_conversations, get_history
        conversations = list_conversations(userId)
        return {
            'conversations': conversations,
            'totalElements': len(conversations),
        }
    except Exception:
        logger.exception('Mongo history read failed')
        return {'conversations': [], 'totalElements': 0}
@app.post('/internal/ai/release')
def release_ai_claim(body: dict):
    conversation_id = body.get('conversation_id')
    reason = body.get('reason', '')
    logger.info('Release AI claim: conv=%s reason=%s', conversation_id, reason)
    return {'success': True, 'message': 'AI claim released'}
