"""eureka.py — Eureka client registration for ai-service."""
import logging
import os
import socket
import threading

logger = logging.getLogger("ai-agent.eureka")

_PORT = int(os.getenv("EUREKA_INSTANCE_PORT", "6070"))
_HOST = os.getenv("EUREKA_INSTANCE_HOST") or socket.gethostbyname(socket.gethostname())
_registered = False
_registration_lock = threading.Lock()


def _do_register() -> None:
    from py_eureka_client import eureka_client
    eureka_client.init(
        eureka_server=os.getenv("EUREKA_SERVER", "http://localhost:6059/eureka"),
        app_name="AI-SERVICE",
        instance_port=_PORT,
        instance_ip=_HOST,
        health_check_url=f"http://{_HOST}:{_PORT}/health",
    )
    logger.info("Registered AI-SERVICE on Eureka (port=%s)", _PORT)


def register_eureka_async() -> None:
    """Register in a daemon thread so py_eureka_client gets its own event loop."""
    global _registered
    if _registered:
        return
    with _registration_lock:
        if _registered:
            return
        try:
            t = threading.Thread(target=_do_register, daemon=True)
            t.start()
            _registered = True
        except Exception as exc:
            logger.warning("Eureka registration failed: %s", exc)
