package com.devteria.identity.kafka;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import com.devteria.event.dto.AuditEvent;
import com.devteria.identity.service.AdminService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class AuditEventConsumer {

    private final AdminService adminService;

    @KafkaListener(topics = "audit.action", groupId = "identity-audit-group")
    public void consume(AuditEvent event) {
        try {
            adminService.createHistory(
                    //                    event.getUsername(),
                    event.getTitle(), event.getDescription(), event.getStatus(), event.getTargetId(), event.getNote());
        } catch (Exception e) {
            log.error(
                    "Failed to save audit event: title={}, username={}: {}",
                    event.getTitle(),
                    event.getUsername(),
                    e.getMessage());
        }
    }
}
