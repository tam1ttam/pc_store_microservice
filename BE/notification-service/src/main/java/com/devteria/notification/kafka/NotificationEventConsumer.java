package com.devteria.notification.kafka;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import com.devteria.event.dto.StoreNotificationEvent;
import com.devteria.notification.service.NotificationService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationEventConsumer {

    private final NotificationService notificationService;

    @KafkaListener(topics = "notification.store", groupId = "notification-store-group")
    public void consume(StoreNotificationEvent event) {
        try {
            if (event.getUserId() == null || event.getUserId().isBlank()) {
                log.warn("Received notification.store event with blank userId, skipping");
                return;
            }
            notificationService.create(
                    event.getUserId(),
                    event.getType(),
                    event.getTitle(),
                    event.getBody(),
                    event.isSystem(),
                    event.isActionRequired(),
                    event.getReferenceId(),
                    event.getReferenceType());
        } catch (Exception e) {
            log.error("Failed to process notification.store event: {}", e.getMessage(), e);
        }
    }
}
