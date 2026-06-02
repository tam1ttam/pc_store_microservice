package com.tam.order.consumer;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import com.tam.order.service.CartService;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class UserRegistrationConsumer {

    CartService cartService;

    @KafkaListener(topics = "user.registered", groupId = "${spring.kafka.consumer.group-id}")
    public void handleUserRegistered(String identityUserId) {
        log.info("Received user.registered event for userId={}", identityUserId);
        try {
            cartService.createCartForUser(identityUserId);
        } catch (Exception e) {
            log.error("Failed to create cart for userId={}: {}", identityUserId, e.getMessage());
        }
    }
}
