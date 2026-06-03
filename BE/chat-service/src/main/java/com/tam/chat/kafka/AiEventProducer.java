package com.tam.chat.kafka;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import com.tam.chat.configuration.AppConfig;

@Component
public class AiEventProducer {
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final String chatMessagesTopic;

    @Autowired
    public AiEventProducer(
            AppConfig appConfig,
            KafkaTemplate<String, String> kafkaTemplate,
            @Value("${spring.kafka.topics.chat-messages:chat-messages}") String chatMessagesTopic) {
        this.kafkaTemplate = kafkaTemplate;
        this.chatMessagesTopic = chatMessagesTopic;
    }

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
