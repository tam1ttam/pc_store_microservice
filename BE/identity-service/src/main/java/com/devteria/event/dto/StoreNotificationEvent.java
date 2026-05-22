package com.devteria.event.dto;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class StoreNotificationEvent {
    String userId;
    String type;
    String title;
    String body;
    boolean isSystem;
    boolean actionRequired;
    String referenceId;
    String referenceType;
}
