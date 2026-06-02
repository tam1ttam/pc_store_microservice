package com.devteria.notification.service.impl;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.bson.types.ObjectId;
import org.springframework.stereotype.Service;

import com.devteria.notification.dto.response.NotificationResponse;
import com.devteria.notification.entity.Notification;
import com.devteria.notification.repository.NotificationRepository;
import com.devteria.notification.service.NotificationService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationServiceImpl implements NotificationService {

    private final NotificationRepository notificationRepository;

    @Override
    public NotificationResponse create(
            String userId,
            String type,
            String title,
            String body,
            boolean isSystem,
            boolean actionRequired,
            String referenceId,
            String referenceType) {
        Notification n = Notification.builder()
                .userId(userId)
                .type(type)
                .title(title)
                .body(body)
                .isSystem(isSystem)
                .actionRequired(actionRequired)
                .referenceId(referenceId)
                .referenceType(referenceType)
                .build();
        n = notificationRepository.save(n);
        log.info("Created notification id={} for userId={} type={}", n.getId(), userId, type);
        return toResponse(n);
    }

    @Override
    public List<NotificationResponse> getByUserId(String userId, boolean unreadOnly) {
        List<Notification> all = notificationRepository.findAllByUserIdOrderByIsSystemDescCreatedAtDesc(userId);
        if (unreadOnly) {
            all = all.stream().filter(n -> !n.isRead()).collect(Collectors.toList());
        }
        // SYSTEM always first, then by createdAt desc
        return all.stream()
                .sorted(Comparator.comparing(Notification::isSystem)
                        .reversed()
                        .thenComparing(
                                Comparator.comparing(Notification::getCreatedAt).reversed()))
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public long countUnread(String userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Override
    public NotificationResponse markAsRead(String notificationId, String userId) {
        Notification n = notificationRepository
                .findByIdAndUserId(new ObjectId(notificationId), userId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        n.setRead(true);
        n = notificationRepository.save(n);
        return toResponse(n);
    }

    @Override
    public void markAllAsRead(String userId) {
        List<Notification> unread = notificationRepository.findUnreadByUserId(userId);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }

    @Override
    public NotificationResponse markActionDone(String notificationId, String userId) {
        Notification n = notificationRepository
                .findByIdAndUserId(new ObjectId(notificationId), userId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        n.setActionDone(true);
        n.setRead(true);
        n = notificationRepository.save(n);
        return toResponse(n);
    }

    private NotificationResponse toResponse(Notification n) {
        return NotificationResponse.builder()
                .id(n.getId().toString())
                .userId(n.getUserId())
                .type(n.getType())
                .title(n.getTitle())
                .body(n.getBody())
                .isRead(n.isRead())
                .isSystem(n.isSystem())
                .actionRequired(n.isActionRequired())
                .actionDone(n.isActionDone())
                .referenceId(n.getReferenceId())
                .referenceType(n.getReferenceType())
                .createdAt(n.getCreatedAt())
                .build();
    }
}
