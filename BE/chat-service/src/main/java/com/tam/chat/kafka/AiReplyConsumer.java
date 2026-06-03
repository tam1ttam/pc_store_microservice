package com.tam.chat.kafka;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tam.chat.service.ChatMessageService;

@Component
public class AiReplyConsumer {
    private static final Logger log = LoggerFactory.getLogger(AiReplyConsumer.class);
    private final ChatMessageService chatMessageService;
    private final ObjectMapper objectMapper;
    private final String aiRepliesTopic;

    @Autowired
    public AiReplyConsumer(
            ChatMessageService chatMessageService,
            ObjectMapper objectMapper,
            @Value("${spring.kafka.topics.ai-replies:ai-replies}") String aiRepliesTopic) {
        this.chatMessageService = chatMessageService;
        this.objectMapper = objectMapper;
        this.aiRepliesTopic = aiRepliesTopic;
    }

    @KafkaListener(
            topics = "${spring.kafka.topics.ai-replies:ai-replies}",
            groupId = "chat-service-ai-group",
            containerFactory = "kafkaListenerContainerFactory")
    public void onAiReply(String payload) {
        try {
            AiReplyMessage msg = objectMapper.readValue(payload, AiReplyMessage.class);
            chatMessageService.createAiMessage(msg.conversationId(), "ai_agent_manager", msg.text(), msg.messageType());
            log.info("AI reply persisted: conv={} sender=ai_agent_manager", msg.conversationId());
        } catch (Exception exc) {
            log.error("Failed to process AI reply: {}", payload, exc);
        }
    }

    public record AiReplyMessage(
            String conversationId, String userId, String text, String messageType, String sender) {}
}
