"""product_client.py — REST calls to product-service via API Gateway."""
import os
from typing import Any

import requests

logger = __import__('logging').getLogger('ai-agent.product')

BASE = os.getenv(
    'PRODUCT_SERVICE_URL', 'http://localhost:6060/api-gateway/product-service'
).rstrip('/')


def search_products(keyword: str, limit: int = 5) -> list[dict[str, Any]]:
    resp = requests.get(f'{BASE}/products/search', params={'keyword': keyword}, timeout=10)
    resp.raise_for_status()
    body = resp.json()
    items = (body.get('result') or {}).get('content') or (body.get('result') or [])
    out = []
    for p in items[:limit]:
        out.append({
            'id': p.get('id') or p.get('_id'),
            'name': p.get('name'),
            'price': p.get('price'),
            'unit': p.get('unit'),
            'img': p.get('img'),
            'inStock': p.get('inStock'),
            'category': p.get('category'),
            'supplier': p.get('supplier', {}).get('name') if isinstance(p.get('supplier'), dict) else p.get('supplier'),
        })
    return out


def get_product_detail(product_id: str) -> dict[str, Any]:
    resp = requests.get(f'{BASE}/products/{product_id}', timeout=10)
    if resp.status_code == 404:
        return {}
    resp.raise_for_status()
    body = resp.json()
    p = body.get('result') or {}
    return {
        'id': p.get('id') or p.get('_id'),
        'name': p.get('name'),
        'price': p.get('price'),
        'unit': p.get('unit'),
        'img': p.get('img'),
        'inStock': p.get('inStock'),
        'category': p.get('category'),
        'description': p.get('description'),
        'supplier': p.get('supplier'),
        'attributes': p.get('attributes') or [],
    }


def get_remaining_stock(product_id: str) -> int:
    try:
        detail = get_product_detail(product_id)
        return detail.get('inStock', -1)
    except Exception as exc:
        logger.warning('get_remaining_stock failed: %s', exc)
        return -1
