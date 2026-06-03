"""LangChain Tools for the AI agent.

Each tool wraps a REST call to the microservices:
- search_product  -> product-service
- get_product_info -> product-service
- add_to_cart     -> order-service
- check_stock     -> product-service
- get_vouchers    -> order-service
- transfer_to_human -> chat-service (releases AI claim)
- list_recent_orders -> order-service
"""
import logging
import os
from typing import Any, Optional

import requests
from langchain_core.tools import tool

from services.product_client import search_products, get_product_detail, get_remaining_stock
from services.order_client import add_to_cart, get_available_vouchers

logger = logging.getLogger("ai-agent.tools")

CHAT_SERVICE_URL = os.getenv(
    "CHAT_SERVICE_URL", "http://localhost:6060/api-gateway/chat-service"
).rstrip("/")
ORDER_SERVICE_URL = os.getenv(
    "ORDER_SERVICE_URL", "http://localhost:6060/api-gateway/order-service"
).rstrip("/")
NEWLINE = "\n"


@tool
def search_product(keyword: str) -> str:
    """Tim kiem san pham trong kho theo tu khoa. Tra ve danh sach san pham tim duoc."""
    try:
        products = search_products(keyword, limit=5)
        if not products:
            return "Khong tim thay san pham nao phu hop."
        lines = [
            f"{i + 1}. {p['name']} -- {p.get('price', 0):,.0f}d (con {p.get('inStock', '?')})"
            for i, p in enumerate(products)
        ]
        return NEWLINE.join(lines)
    except Exception as exc:
        logger.error("search_product error: %s", exc)
        return f"Loi khi tim kiem: {exc}"


@tool
def get_product_info(product_id: str) -> str:
    """Lay thong tin chi tiet 1 san pham theo ID."""
    try:
        p = get_product_detail(product_id)
        if not p:
            return "San pham khong ton tai."
        stock = get_remaining_stock(product_id)
        attrs = ", ".join(
            f"{a.get('name')}: {a.get('value')}"
            for a in (p.get("attributes") or [])[:3]
        )
        unit_display = p.get("unit") or "--"
        name_display = p.get("name") or "khong ro"
        stock_display = stock if stock >= 0 else "khong ro"
        header = f"{name_display}{NEWLINE}"
        header += f"Gia: {p.get('price', 0):,.0f}d | Don vi: {unit_display}{NEWLINE}"
        header += f"Ton kho: {stock_display}{NEWLINE}"
        if attrs:
            header += f"Thong so: {attrs}"
        return header
    except Exception as exc:
        logger.error("get_product_info error: %s", exc)
        return f"Loi khi lay thong tin san pham: {exc}"


@tool
def add_to_cart_tool(user_id: str, product_id: str, quantity: int = 1) -> str:
    """Them san pham vao gio hang cua nguoi dung."""
    result = add_to_cart(user_id, product_id, quantity)
    if result.get("success"):
        return f"Da them {quantity} san pham vao gio hang."
    return f"Them vao gio hang that bai: {result.get('message')}"


@tool
def check_stock(product_id: str) -> str:
    """Kiem tra so luong con lai trong kho cua 1 san pham."""
    stock = get_remaining_stock(product_id)
    if stock < 0:
        return "Khong kiem tra duoc so luong ton kho."
    if stock == 0:
        return "San pham nay hien da het hang."
    if stock <= 5:
        return f"San pham con it (chi con {stock})."
    return f"San pham con hang ({stock} trong kho)."


@tool
def get_vouchers_for_user(user_id: str) -> str:
    """Lay danh sach voucher kha dung cua nguoi dung."""
    vouchers = get_available_vouchers(user_id)
    if not vouchers:
        return "Ban hien khong co voucher nao kha dung."
    lines = [
        f"- {v.get('code')}: {v.get('description') or 'Khong mo ta'} "
        f"(giam {v.get('discountAmount') or v.get('discountPercent') or 0})"
        for v in vouchers[:5]
    ]
    return f"Voucher cua ban:{NEWLINE}" + NEWLINE.join(lines)


@tool
def transfer_to_human(conversation_id: str, reason: str = "") -> str:
    """Chuyen giao phong chat nay cho manager nguoi that. Dung khi khach gian du, yeu cau gap nguoi that, hoac AI khong xu ly duoc."""
    try:
        url = f"{CHAT_SERVICE_URL}/internal/ai/release"
        payload = {"conversation_id": conversation_id, "reason": reason}
        resp = requests.post(url, json=payload, timeout=10)
        if resp.status_code == 200:
            return "Da chuyen giao cho manager. Mot nhan vien se som phu trach ban."
        return "Khong the chuyen giao luc nay. Ban vui long thu lai sau."
    except Exception as exc:
        logger.error("transfer_to_human error: %s", exc)
        return "Khong the chuyen giao luc nay."


@tool
def list_recent_orders(user_id: str) -> str:
    """Liet ke cac don hang gan day cua nguoi dung."""
    try:
        url = f"{ORDER_SERVICE_URL}/api/orders"
        headers: dict[str, str] = {}
        ai_service_token = os.getenv("AI_SERVICE_TOKEN")
        if ai_service_token:
            headers["Authorization"] = f"Bearer {ai_service_token}"
        resp = requests.get(url, headers=headers, timeout=10)
        resp.raise_for_status()
        body = resp.json()
        orders = (body.get("result") or {}).get("content") or body.get("result") or []
        if not orders:
            return "Ban chua co don hang nao."
        lines = [
            f"- Don #{o.get('id')[:8]}: {o.get('orderStatus')} | {o.get('totalPrice', 0):,.0f}d"
            for o in orders[:5]
        ]
        return f"Don hang gan day:{NEWLINE}" + NEWLINE.join(lines)
    except Exception as exc:
        logger.error("list_recent_orders error: %s", exc)
        return "Khong lay duoc lich su don hang."
