package com.devteria.notification.entity;

import java.time.LocalDateTime;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Document(collection = "notifications")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Notification {

    @Id
    ObjectId id;

    @Indexed
    String userId;

    String type;
    String title;
    String body;

    @Builder.Default
    boolean isRead = false;

    @Builder.Default
    boolean isSystem = false;

    @Builder.Default
    boolean actionRequired = false;

    @Builder.Default
    boolean actionDone = false;

    String referenceId;
    String referenceType;

    @CreatedDate
    LocalDateTime createdAt;
}
