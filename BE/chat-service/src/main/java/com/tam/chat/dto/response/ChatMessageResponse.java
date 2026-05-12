package com.tam.chat.dto.response;

import java.time.Instant;
import java.util.List;

import com.tam.chat.entity.Attachment;
import com.tam.chat.entity.ParticipantInfo;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ChatMessageResponse {
    String id;
    String conversationId;
    boolean me;
    String message;
    ParticipantInfo sender;
    List<Attachment> attachments;
    Instant createdDate;
}
