package com.tam.chat.entity;

import java.time.Instant;
import java.util.List;

import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.MongoId;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "conversation")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Conversation {
    @MongoId
    String id;

    String type; // GROUP, DIRECT, SUPPORT

    @Indexed(unique = true)
    String participantsHash;

    List<ParticipantInfo> participants;

    String clientId; // identity userId of client (SUPPORT type only)
    String assignedManagerId; // identity userId of the manager currently handling

    String lastMessage;
    Instant lastMessageAt;

    Instant createdDate;

    Instant modifiedDate;
}
