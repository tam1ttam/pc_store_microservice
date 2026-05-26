package com.tam.profile.kafka;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import com.tam.profile.kafka.event.UserDeletedEvent;
import com.tam.profile.service.ProfileService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class UserEventConsumer {

    private final ProfileService profileService;

    @KafkaListener(topics = "user.deleted", groupId = "user-service-group")
    public void handleUserDeleted(UserDeletedEvent event) {
        log.info("Received user.deleted event for userId={}, username={}", event.getUserId(), event.getUsername());

        try {
            if (profileService.existsByUserName(event.getUsername())) {
                profileService.deleteProfile(event.getUsername());
                log.info("Profile deleted for username={}", event.getUsername());
            } else {
                log.warn("No profile found for username={}, skipping", event.getUsername());
            }
        } catch (Exception e) {
            log.error("Error deleting profile for username={}: {}", event.getUsername(), e.getMessage());
        }
    }
}
