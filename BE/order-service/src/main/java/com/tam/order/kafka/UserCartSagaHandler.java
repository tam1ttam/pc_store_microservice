package com.tam.order.kafka;

import java.util.*;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import com.tam.order.kafka.UserCartSagaEvents.*;
import com.tam.order.service.CartService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserCartSagaHandler {

    private final CartService cartService;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @KafkaListener(topics = "saga.command")
    public void handleSagaCommand(CartCommand command) {
        log.info("Order Service received Signup Saga Command: {}", command);
        String sagaId = command.getSagaId();
        String type = command.getCommandType();
        Map<String, Object> payload = command.getPayload();

        try {
            boolean success = false;
            String stepName = "";
            Map<String, Object> result = new HashMap<>();

            switch (type) {
                case "CREATE_USER_CART" -> {
                    stepName = "CREATE_USER_CART";
                    // Logic: Tạo cart trống cho user mới
                    success = true; // Mock success
                }
                case "DELETE_USER_CART" -> {
                    stepName = "DELETE_USER_CART";
                    // Logic: Xóa cart khi rollback
                    success = true;
                }
                default -> {
                    log.warn("Unknown signup command type: {}", type);
                    return;
                }
            }

            sendReply(sagaId, stepName, success, null, result);
        } catch (Exception e) {
            log.error("Error handling signup saga command {}: {}", type, e.getMessage());
            sendReply(sagaId, "UNKNOWN", false, e.getMessage(), null);
        }
    }

    private void sendReply(String sagaId, String stepName, boolean success, String error, Map<String, Object> result) {
        CartReply reply = CartReply.builder()
                .sagaId(sagaId)
                .stepName(stepName)
                .success(success)
                .errorReason(error)
                .result(result)
                .build();
        kafkaTemplate.send("saga.reply", reply);
    }
}
