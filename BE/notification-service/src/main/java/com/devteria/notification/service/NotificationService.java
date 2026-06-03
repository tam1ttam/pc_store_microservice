package com.devteria.notification.service;

import java.util.List;

import com.devteria.notification.dto.response.NotificationResponse;

public interface NotificationService {

    NotificationResponse create(
            String userId,
            String type,
            String title,
            String body,
            boolean isSystem,
            boolean actionRequired,
            String referenceId,
            String referenceType);

    List<NotificationResponse> getByUserId(String userId, boolean unreadOnly);

    long countUnread(String userId);

    NotificationResponse markAsRead(String notificationId, String userId);

    void markAllAsRead(String userId);

    NotificationResponse markActionDone(String notificationId, String userId);
}
