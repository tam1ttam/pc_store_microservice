package com.tam.chat.dto.response;

import java.time.Instant;
import java.util.List;

import com.tam.chat.entity.Attachment;
import com.tam.chat.entity.MessageType;
import com.tam.chat.entity.ParticipantInfo;
import com.tam.chat.entity.ProductCardPayload;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageResponse {
    String id;
    Instant createdDate;
    String conversationId;
    MessageType messageType;
    ProductCardPayload productCard;
    String message;
    ParticipantInfo sender;
    boolean me;
    List<Attachment> attachments;
}
