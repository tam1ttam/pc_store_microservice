"""order_client.py — REST calls to order-service for cart + voucher operations."""
import os
from typing import Any

import requests

logger = __import__('logging').getLogger('ai-agent.order')

BASE = os.getenv(
    'ORDER_SERVICE_URL', 'http://localhost:6060/api-gateway/order-service'
).rstrip('/')


def get_available_vouchers(user_id: str) -> list[dict[str, Any]]:
    try:
        resp = requests.get(f'{BASE}/vouchers', params={'userId': user_id}, timeout=10)
        resp.raise_for_status()
        body = resp.json()
        return body.get('result') or []
    except Exception as exc:
        logger.warning('get_available_vouchers failed: %s', exc)
        return []


def add_to_cart(user_id: str, product_id: str, quantity: int = 1) -> dict[str, Any]:
    payload = {'productId': product_id, 'quantity': quantity}
    try:
        resp = requests.put(f'{BASE}/cart/items', json=payload, timeout=10)
        resp.raise_for_status()
        body = resp.json()
        return {'success': True, 'cart': body.get('result'), 'message': 'Đã thêm vào giỏ hàng'}
    except Exception as exc:
        logger.error('add_to_cart failed: %s', exc)
        return {'success': False, 'message': str(exc)}
