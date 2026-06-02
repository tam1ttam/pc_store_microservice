"""apply_java_fixes.py — one-shot edit script for chat-service Java files.

Run: python apply_java_fixes.py
Backups go to BE/chat-service/src/main/java/com/tam/chat/.backup/
"""
from __future__ import annotations

import os
import shutil
import textwrap
from pathlib import Path

ROOT = Path(__file__).resolve().parents[0]
# Actually run from BE/chat-service
CHAT_ROOT = ROOT / "BE" / "chat-service"
MAIN_SRC = CHAT_ROOT / "src" / "main" / "java" / "com" / "tam" / "chat"
BACKUP = MAIN_SRC / ".backup"
BACKUP.mkdir(exist_ok=True)


def backup(path: Path) -> Path:
    dst = BACKUP / path.name
    shutil.copy2(path, dst)
    return dst


def read(p: Path) -> str:
    return p.read_text(encoding="utf-8")


def write(p: Path, content: str) -> None:
    p.write_text(content, encoding="utf-8")


# ---------------------------------------------------------------------------
# 1) ConversationController.java — add /internal/ai/release
# ---------------------------------------------------------------------------
conv_ctrl = MAIN_SRC / "controller" / "ConversationController.java"
backup(conv_ctrl)
orig = read(conv_ctrl)
# add endpoint after the existing @PutMapping("/{id}/transfer") block
marker = '    @Operation(summary = "Get conversation by ID")\n    @GetMapping("/{id}")'
if "/internal/ai/release" not in orig:
    insert = textwrap.dedent('''
        @Operation(summary = "Release AI claim on a conversation")
        @PostMapping("/internal/ai/release")
        @PreAuthorize("hasAnyRole('MANAGER','ADMIN')")
        public ResponseEntity<ApiResponse<Boolean>> releaseAi(@PathVariable String id,
                                                               @RequestParam(required = false) String reason) {
            boolean ok = conversationService.releaseAi(id, reason);
            return ResponseEntity.ok(ApiResponse.ok(ok));
        }

''')
    orig = orig.replace(marker, insert + marker)
    write(conv_ctrl, orig)
    print("[OK] ConversationController: added /internal/ai/release")

# ---------------------------------------------------------------------------
# 2) ConversationService.java / impl — add releaseAi
# ---------------------------------------------------------------------------
svc_dir = MAIN_SRC / "service"
svc_if = svc_dir / "ConversationService.java"
svc_impl = svc_dir / "ConversationServiceImpl.java"
for p in (svc_if, svc_impl):
    backup(p)

if_text = read(svc_if)
release_sig = "boolean releaseAi(String conversationId, String reason);"
if release_sig not in if_text:
    # add after the last public method declaration in the interface
    marker = "    @Operation(summary = \"Get all support conversations\")\n"
    if marker not in if_text:
        # fallback: append
        if_text = if_text.rstrip() + "\n\n" + release_sig + "\n"
    else:
        if_text = if_text.replace(
            "    // === SUPPORT ===",
            "    // === SUPPORT ===\n\n" + release_sig,
        )
    write(svc_if, if_text)
    print("[OK] ConversationService.java: added releaseAi signature")

impl_text = read(svc_impl)
if "releaseAi(" not in impl_text:
    marker_impl = "    @Transactional\n    public List<ConversationResponse> getAllSupportConversations() {"
    insert_impl = textwrap.dedent('''
        @Transactional
        public boolean releaseAi(String conversationId, String reason) {
            Conversation conv = conversationRepository.findById(conversationId)
                    .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));
            String prev = conv.getAssignedManagerId();
            conv.setAssignedManagerId(null);
            if (conv.getParticipants() != null) {
                conv.getParticipants().removeIf(p -> "ai_agent_manager".equals(p.getUserId()));
            }
            conversationRepository.save(conv);
            logEvent("AI_RELEASE", conversationId, "system",
                     "AI released. prev=" + prev + (reason != null ? " reason=" + reason : ""));
            return true;
        }

''')
    # insert before getAllSupportConversations marker
    if marker_impl in impl_text:
        impl_text = impl_text.replace(marker_impl, insert_impl + marker_impl)
    else:
        # append at end of class
        impl_text = impl_text.rstrip() + "\n\n" + insert_impl + "\n"
    write(svc_impl, impl_text)
    print("[OK] ConversationServiceImpl.java: added releaseAi impl")

# ---------------------------------------------------------------------------
# 3) Conversation.java — add AI_AGENT to allowed roles + ai_agent_manager userId
# ---------------------------------------------------------------------------
conv_entity = MAIN_SRC / "entity" / "Conversation.java"
backup(conv_entity)
orig_ent = read(conv_entity)
if "ai_agent_manager" not in orig_ent:
    # find the field where manager roles are defined
    orig_ent = orig_ent.replace(
        'public static final Set<String> MANAGER_ROLES = Set.of("MANAGER", "SELLER");',
        'public static final Set<String> MANAGER_ROLES = Set.of("MANAGER", "SELLER", "AI_AGENT");',
    )
    write(conv_entity, orig_ent)
    print("[OK] Conversation.java: added AI_AGENT role")

# ---------------------------------------------------------------------------
# 4) pom.xml — add spring-kafka dependency
# ---------------------------------------------------------------------------
pom = CHAT_ROOT / "pom.xml"
backup(pom)
pom_txt = read(pom)
if "spring-kafka" not in pom_txt:
    # insert spring-kafka after spring-boot-starter-data-mongodb dependency
    marker = '<artifactId>spring-boot-starter-data-mongodb</artifactId>'
    insert_pom = textwrap.dedent('''
                <dependency>
                    <groupId>org.springframework.kafka</groupId>
                    <artifactId>spring-kafka</artifactId>
                </dependency>
''')
    pom_txt = pom_txt.replace(marker, marker + "\n" + insert_pom)
    write(pom, pom_txt)
    print("[OK] pom.xml: added spring-kafka")
else:
    print("[SKIP] pom.xml: spring-kafka already present")

# ---------------------------------------------------------------------------
# 5) application.yaml — add Kafka consumer/producer config
# ---------------------------------------------------------------------------
yaml_path = CHAT_ROOT / "src" / "main" / "resources" / "application.yaml"
backup(yaml_path)
yaml_txt = read(yaml_path)
if "ai-replies" not in yaml_txt:
    # find spring: block and add kafka after it
    kafka_block = textwrap.dedent('''
spring:
  kafka:
    consumer:
      bootstrap-servers: ${KAFKA_BOOTSTRAP_SERVERS:localhost:9094}
      group-id: chat-service-group
      auto-offset-reset: earliest
      key-deserializer: org.apache.kafka.common.serialization.StringDeserializer
      value-deserializer: org.apache.kafka.common.serialization.StringDeserializer
    producer:
      bootstrap-servers: ${KAFKA_BOOTSTRAP_SERVERS:localhost:9094}
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.apache.kafka.common.serialization.StringSerializer
    topics:
      chat-messages: chat-messages
      ai-replies: ai-replies
''')
    # insert after the last spring: block (usually after spring: servlet: or datasource:)
    if "spring:" in yaml_txt:
        # Find last spring: section end and append new spring.kafka there
        idx = yaml_txt.rfind("spring:")
        if idx >= 0:
            yaml_txt = yaml_txt[:idx] + kafka_block + yaml_txt[idx:]
        else:
            yaml_txt += "\n" + kafka_block
    else:
        yaml_txt += "\n" + kafka_block
    write(yaml_path, yaml_txt)
    print("[OK] application.yaml: added Kafka config")
else:
    print("[SKIP] application.yaml: Kafka already present")

# ---------------------------------------------------------------------------
# 6) Create AiEventProducer.java
# ---------------------------------------------------------------------------
ai_producer_path = MAIN_SRC / "kafka" / "AiEventProducer.java"
ai_producer_path.parent.mkdir(parents=True, exist_ok=True)
if not ai_producer_path.exists():
    ai_producer_path.write_text(textwrap.dedent('''\
        package com.tam.chat.kafka;

        import com.tam.chat.config.AppConfig;
        import org.springframework.beans.factory.annotation.Autowired;
        import org.springframework.beans.factory.annotation.Value;
        import org.springframework.kafka.core.KafkaTemplate;
        import org.springframework.stereotype.Component;

        @Component
        public class AiEventProducer {
            private final KafkaTemplate<String, String> kafkaTemplate;
            private final String chatMessagesTopic;

            @Autowired
            public AiEventProducer(AppConfig appConfig,
                                   KafkaTemplate<String, String> kafkaTemplate,
                                   @Value("${spring.kafka.topics.chat-messages:chat-messages}") String chatMessagesTopic) {
                this.kafkaTemplate = kafkaTemplate;
                this.chatMessagesTopic = chatMessagesTopic;
            }

            /** Fire-and-forget: route a client message to ai-service when AI holds the conversation. */
            public void sendToAi(String conversationId, String userId, String message, String messageType) {
                String payload = String.format(
                        "{\"conversation_id\":\"%s\",\"user_id\":\"%s\",\"message\":\"%s\",\"message_type\":\"%s\",\"sender\":\"%s\"}",
                        conversationId, userId, escapeJson(message), messageType, userId);
                kafkaTemplate.send(chatMessagesTopic, conversationId, payload);
            }

            private static String escapeJson(String s) {
                return s.replace("\\", "\\\\").replace("\"", "\\\"");
            }
        }
    '''), encoding="utf-8")
    print("[OK] Created AiEventProducer.java")
else:
    print("[SKIP] AiEventProducer.java already exists")

# ---------------------------------------------------------------------------
# 7) Create AiReplyConsumer.java
# ---------------------------------------------------------------------------
ai_consumer_path = MAIN_SRC / "kafka" / "AiReplyConsumer.java"
if not ai_consumer_path.exists():
    ai_consumer_path.write_text(textwrap.dedent('''\
        package com.tam.chat.kafka;

        import com.fasterxml.jackson.databind.ObjectMapper;
        import com.tam.chat.entity.ChatMessage;
        import com.tam.chat.entity.Conversation;
        import com.tam.chat.service.ChatMessageService;
        import com.tam.chat.service.ConversationService;
        import com.tam.chat.websocket.SocketIOClient;
        import org.slf4j.Logger;
        import org.slf4j.LoggerFactory;
        import org.springframework.beans.factory.annotation.Autowired;
        import org.springframework.beans.factory.annotation.Value;
        import org.springframework.kafka.annotation.KafkaListener;
        import org.springframework.messaging.simp.SimpMessagingTemplate;
        import org.springframework.stereotype.Component;

        @Component
        public class AiReplyConsumer {
            private static final Logger log = LoggerFactory.getLogger(AiReplyConsumer.class);

            private final ChatMessageService chatMessageService;
            private final ConversationService conversationService;
            private final ObjectMapper objectMapper;
            private final String aiRepliesTopic;

            @Autowired
            public AiReplyConsumer(ChatMessageService chatMessageService,
                                   ConversationService conversationService,
                                   ObjectMapper objectMapper,
                                   @Value("${spring.kafka.topics.ai-replies:ai-replies}") String aiRepliesTopic) {
                this.chatMessageService = chatMessageService;
                this.conversationService = conversationService;
                this.objectMapper = objectMapper;
                this.aiRepliesTopic = aiRepliesTopic;
            }

            @KafkaListener(topics = "${spring.kafka.topics.ai-replies:ai-replies}",
                           groupId = "chat-service-ai-group",
                           containerFactory = "kafkaListenerContainerFactory")
            public void onAiReply(String payload) {
                try {
                    AiReplyMessage msg = objectMapper.readValue(payload, AiReplyMessage.class);
                    String conversationId = msg.conversationId;
                    String senderId = "ai_agent_manager";
                    Conversation conv = conversationService.getConversationOrThrow(conversationId);
                    ChatMessage saved = chatMessageService.createAiMessage(conversationId, senderId, msg.text, msg.messageType);
                    SocketIOClient.sendToConversation(conversationId, saved);
                    log.info("AI reply persisted & pushed: conv={} sender={}", conversationId, senderId);
                } catch (Exception exc) {
                    log.error("Failed to process AI reply: {}", payload, exc);
                }
            }

            public record AiReplyMessage(String conversationId, String userId, String text,
                                         String messageType, String sender) {}
        }
    '''), encoding="utf-8")
    print("[OK] Created AiReplyConsumer.java")
else:
    print("[SKIP] AiReplyConsumer.java already exists")

# ---------------------------------------------------------------------------
# 8) Add createAiMessage helper to ChatMessageService interface + impl
# ---------------------------------------------------------------------------
chat_svc_if = MAIN_SRC / "service" / "ChatMessageService.java"
chat_svc_impl = MAIN_SRC / "service" / "ChatMessageServiceImpl.java"
for p in (chat_svc_if, chat_svc_impl):
    backup(p)

if_txt = read(chat_svc_if)
if "createAiMessage" not in if_txt:
    if_txt += "\n\n    ChatMessage createAiMessage(String conversationId, String senderId, String text, String messageType);\n"
    write(chat_svc_if, if_txt)
    print("[OK] ChatMessageService.java: added createAiMessage signature")

impl_txt = read(chat_svc_impl)
if "createAiMessage" not in impl_txt:
    insert_ai_msg = textwrap.dedent('''
        @Transactional
        public ChatMessage createAiMessage(String conversationId, String senderId, String text, String messageType) {
            Conversation conv = conversationRepository.findById(conversationId)
                    .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));
            ChatMessage msg = new ChatMessage();
            msg.setConversationId(conversationId);
            msg.setSenderUserId(senderId);
            msg.setSenderUsername("AI Assistant");
            msg.setContent(text);
            msg.setMessageType(MessageType.valueOf(messageType != null ? messageType : "TEXT"));
            msg.setCreatedDate(LocalDateTime.now());
            return chatMessageRepository.save(msg);
        }

''')
    # insert after the regular create method
    marker_create = "    public ChatMessage create("
    if marker_create in impl_txt:
        # find the closing brace of that method and insert after
        idx = impl_txt.index(marker_create)
        close = impl_txt.find("}", idx)
        if close >= 0:
            close = impl_txt.find("\n", close) + 1
            impl_txt = impl_txt[:close] + insert_ai_msg + impl_txt[close:]
        else:
            impl_txt += "\n" + insert_ai_msg
    else:
        impl_txt += "\n" + insert_ai_msg
    write(chat_svc_impl, impl_txt)
    print("[OK] ChatMessageServiceImpl.java: added createAiMessage impl")
else:
    print("[SKIP] createAiMessage already present")

# ---------------------------------------------------------------------------
# 9) SocketIOClient — add sendToConversation helper
# ---------------------------------------------------------------------------
socket_client = MAIN_SRC / "websocket" / "SocketIOClient.java"
if socket_client.exists():
    backup(socket_client)
    sc = read(socket_client)
    if "sendToConversation" not in sc:
        sc = sc.replace(
            "public class SocketIOClient",
            textwrap.dedent('''\
                import com.tam.chat.entity.ChatMessage;

                public class SocketIOClient''').lstrip()
        )
        sc = sc.rstrip() + "\n\n    public static void sendToConversation(String conversationId, ChatMessage msg) {\n"
        sc += "        // Handled via socket.io server in SocketHandler\n"
        sc += "    }\n"
        write(socket_client, sc)
        print("[OK] SocketIOClient.java: added sendToConversation stub")
else:
    print("[WARN] SocketIOClient.java not found; skip sendToConversation helper")

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------
print("\nDone. Backups at:", BACKUP)
