package com.tam.product.kafka;

import java.util.*;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import com.tam.product.kafka.ProductSagaEvents.*;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductSagaHandler {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    @KafkaListener(topics = "saga.command", groupId = "product-service-saga-group")
    public void handleSagaCommand(StockCommand command) {
        log.info("Product Service received Saga Command: {}", command);
        String sagaId = command.getSagaId();
        String type = command.getCommandType();
        Map<String, Object> payload = command.getPayload();

        try {
            boolean success = false;
            String stepName = "";
            Map<String, Object> result = new HashMap<>();

            switch (type) {
                case "RESERVE_STOCK" -> {
                    stepName = "RESERVE_STOCK";
                    // Logic: Trừ stock sản phẩm.
                    // Hiện tại mock success. Thực tế sẽ gọi productRepository.updateStock(...)
                    success = true;
                }
                case "RELEASE_STOCK" -> {
                    stepName = "RELEASE_STOCK";
                    // Logic: Hoàn lại stock.
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
        StockReply reply = StockReply.builder()
                .sagaId(sagaId)
                .stepName(stepName)
                .success(success)
                .errorReason(error)
                .result(result)
                .build();
        kafkaTemplate.send("saga.reply", reply);
    }
}
