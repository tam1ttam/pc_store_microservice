package com.tam.product.kafka;

import org.bson.types.ObjectId;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import com.tam.product.kafka.event.OrderCreatedEvent;
import com.tam.product.kafka.event.OrderItemEvent;
import com.tam.product.service.ProductService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class OrderEventConsumer {

    private final ProductService productService;

    @KafkaListener(topics = "order.created", groupId = "product-group")
    public void handleOrderCreated(OrderCreatedEvent event) {
        log.info(
                "Received order.created event for orderId={}, {} items",
                event.getOrderId(),
                event.getItems() != null ? event.getItems().size() : 0);

        if (event.getItems() == null || event.getItems().isEmpty()) {
            return;
        }

        for (OrderItemEvent item : event.getItems()) {
            try {
                boolean updated =
                        productService.updateInStockProduct(new ObjectId(item.getProductId()), -item.getQuantity());

                if (updated) {
                    log.info("Stock updated: productId={}, deducted={}", item.getProductId(), item.getQuantity());
                } else {
                    log.warn("Stock update failed: productId={}", item.getProductId());
                }
            } catch (Exception e) {
                log.error("Error updating stock for productId={}: {}", item.getProductId(), e.getMessage());
            }
        }
    }
}
