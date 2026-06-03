package com.devteria.notification.dto.response;

import java.time.LocalDateTime;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NotificationResponse {
    String id;
    String userId;
    String type;
    String title;
    String body;
    boolean isRead;
    boolean isSystem;
    boolean actionRequired;
    boolean actionDone;
    String referenceId;
    String referenceType;
    LocalDateTime createdAt;
}
