package com.tam.profile.kafka;

import java.util.*;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import com.tam.profile.kafka.ProfileSagaEvents.*;
import com.tam.profile.service.ProfileService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProfileSagaHandler {

    private final ProfileService profileService;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @KafkaListener(topics = "saga.command")
    public void handleSagaCommand(ProfileCommand command) {
        log.info("User Service received Saga Command: {}", command);
        String sagaId = command.getSagaId();
        String type = command.getCommandType();
        Map<String, Object> payload = command.getPayload();

        try {
            boolean success = false;
            String stepName = "";
            Map<String, Object> result = new HashMap<>();

            switch (type) {
                case "CREATE_CUSTOMER_PROFILE" -> {
                    stepName = "CREATE_CUSTOMER_PROFILE";
                    // Logic tạo profile thực tế gọi profileService.createProfile(...)
                    success = true; // Mock success for now
                }
                case "DELETE_CUSTOMER_PROFILE" -> {
                    stepName = "DELETE_CUSTOMER_PROFILE";
                    // Logic xóa profile thực tế
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
        ProfileReply reply = ProfileReply.builder()
                .sagaId(sagaId)
                .stepName(stepName)
                .success(success)
                .errorReason(error)
                .result(result)
                .build();
        kafkaTemplate.send("saga.reply", reply);
    }
}
