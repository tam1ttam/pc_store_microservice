package com.devteria.identity.kafka;

import java.util.*;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import com.devteria.identity.kafka.IdentitySagaEvents.*;
import com.devteria.identity.service.UserService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class IdentitySagaHandler {

    private final UserService userService;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @KafkaListener(topics = "saga.command", groupId = "identity-service-saga-group")
    public void handleSagaCommand(AccountCommand command) {
        log.info("Identity Service received Saga Command: {}", command);
        String sagaId = command.getSagaId();
        String type = command.getCommandType();
        Map<String, Object> payload = command.getPayload();

        try {
            boolean success = false;
            String stepName = "";
            Map<String, Object> result = new HashMap<>();

            switch (type) {
                case "CREATE_IDENTITY_ACCOUNT" -> {
                    stepName = "CREATE_IDENTITY_ACCOUNT";
                    // Logic tạo account thực tế gọi userService.createUser(...)
                    // Mock success for now
                    success = true;
                }
                case "DELETE_IDENTITY_ACCOUNT" -> {
                    stepName = "DELETE_IDENTITY_ACCOUNT";
                    // Logic xóa account thực tế
                    success = true;
                }
                default -> {
                    log.warn("Unknown command type: {}", type);
                    return;
                }
            }

            sendReply(sagaId, stepName, success, null, result);
        } catch (Exception e) {
            log.error("Error handling saga command {}: {}", type, e.getMessage());
            sendReply(sagaId, "UNKNOWN", false, e.getMessage(), null);
        }
    }

    private void sendReply(String sagaId, String stepName, boolean success, String error, Map<String, Object> result) {
        AccountReply reply = AccountReply.builder()
                .sagaId(sagaId)
                .stepName(stepName)
                .success(success)
                .errorReason(error)
                .result(result)
                .build();
        kafkaTemplate.send("saga.reply", reply);
    }
}
