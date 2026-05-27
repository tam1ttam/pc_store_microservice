package com.tam.order.kafka;

import java.util.*;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import com.tam.order.kafka.OrderSagaEvents.*;
import com.tam.order.service.OrderService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class OrderSagaHandler {

    private final OrderService orderService;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @KafkaListener(topics = "saga.command", groupId = "order-service-saga-group")
    public void handleSagaCommand(CheckoutCommand command) {
        log.info("Order Service received Saga Command: {}", command);
        String sagaId = command.getSagaId();
        String type = command.getCommandType();
        Map<String, Object> payload = command.getPayload();

        try {
            boolean success = false;
            String stepName = "";
            Map<String, Object> result = new HashMap<>();

            switch (type) {
                case "APPLY_VOUCHER" -> {
                    stepName = "APPLY_VOUCHER";
                    // Logic áp dụng voucher thực tế sẽ gọi voucherService
                    success = true; // Mock success for now
                }
                case "CREATE_PAYPAL_ORDER" -> {
                    stepName = "CREATE_PAYPAL_ORDER";
                    // Logic gọi PayPal API
                    success = true; // Mock success
                }
                case "COMPENSATE_ORDER" -> {
                    stepName = "COMPENSATE_ORDER";
                    // Logic: Cập nhật Order status = CANCELLED
                    Long orderId = Long.valueOf(payload.get("orderId").toString());
                    orderService.updateOrderStatus(orderId, "CANCELLED");
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
        CheckoutReply reply = CheckoutReply.builder()
                .sagaId(sagaId)
                .stepName(stepName)
                .success(success)
                .errorReason(error)
                .result(result)
                .build();
        kafkaTemplate.send("saga.reply", reply);
    }
}
