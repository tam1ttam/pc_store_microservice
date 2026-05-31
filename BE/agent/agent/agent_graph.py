"""agent_graph.py — LangChain/LangGraph Agent definition for ai-service."""
import os
from typing import Any, Optional

from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_openai import ChatOpenAI

from agent.tools import TOOLS

logger = __import__("logging").getLogger("ai-agent.graph")

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
OPENROUTER_MODEL = os.getenv("OPENROUTER_MODEL", "meta-llama/llama-3.3-70b-instruct")
OPENROUTER_BASE_URL = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")

SYSTEM_PROMPT = (
    "Ban la tro ly ao mua sam ban hang cua PCStore - cua hang ban PC/linh kien. "
    "Ban co the: tim san pham, xem thong tin chi tiet, them vao gio hang, kiem tra ton kho, "
    "xem voucher, xem don hang gan day, va chuyen giao cho nhan vien that khi can. "
    "Tra loi bang tieng Viet, ngan gon, than thien."
)


class AIAgent:
    def __init__(self, user_id: str = "anonymous", conversation_id: str = "") -> None:
        self.user_id = user_id
        self.conversation_id = conversation_id
        self.llm = ChatOpenAI(
            model=OPENROUTER_MODEL,
            openai_api_key=OPENROUTER_API_KEY,
            base_url=OPENROUTER_BASE_URL,
            temperature=0.7,
        )
        prompt = ChatPromptTemplate.from_messages(
            [
                ("system", SYSTEM_PROMPT),
                MessagesPlaceholder(variable_name="history"),
                ("human", "{input}"),
            ]
        )
        self.chain = prompt | self.llm

    def chat(
        self,
        message: str,
        history: Optional[list[dict[str, str]]] = None,
    ) -> str:
        try:
            messages: list[Any] = []
            if history:
                for turn in history[-10:]:
                    role = turn.get("role", "user")
                    content = turn.get("content", "")
                    if role == "user":
                        messages.append(HumanMessage(content=content))
                    else:
                        messages.append(AIMessage(content=content))
            response = self.chain.invoke(
                {"history": messages, "input": message},
                config={"configurable": {"thread_id": self.conversation_id or self.user_id}},
            )
            return str(response.content)
        except Exception as exc:
            logger.exception("chat failed: %s", exc)
            return (
                "Toi dang gap van de ket noi. "
                "Ban vui long thu lai sau hoac yeu cau chuyen giao cho nhan vien that."
            )
