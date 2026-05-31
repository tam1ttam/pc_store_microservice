"""eureka.py — Eureka client registration for ai-service."""
import logging
import os
import socket

logger = logging.getLogger("ai-agent.eureka")

_PORT = int(os.getenv("EUREKA_INSTANCE_PORT", "6070"))
_HOST = os.getenv("EUREKA_INSTANCE_HOST") or socket.gethostbyname(socket.gethostname())


def register_eureka() -> None:
    from py_eureka_client import eureka_client
    eureka_client.init(
        eureka_server=os.getenv("EUREKA_SERVER", "http://localhost:6059/eureka"),
        app_name="AI-SERVICE",
        instance_port=_PORT,
        instance_ip=_HOST,
        health_check_url=f"http://{_HOST}:{_PORT}/health",
    )
    logger.info("Registered AI-SERVICE on Eureka (port=%s)", _PORT)
