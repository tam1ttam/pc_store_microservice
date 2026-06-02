package com.tam.chat.dto.request;

import java.util.List;

import jakarta.validation.constraints.Size;

import com.tam.chat.entity.Attachment;
import com.tam.chat.entity.MessageType;
import com.tam.chat.entity.ProductCardPayload;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageRequest {
    String conversationId;
    MessageType messageType = MessageType.TEXT;
    ProductCardPayload productCard;

    @Size(min = 0, message = "Message cannot be blank")
    String message;

    List<Attachment> attachments;
}
