package com.tam.chat.dto.request;

import java.util.List;

import jakarta.validation.constraints.NotBlank;

import com.tam.chat.entity.Attachment;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ChatMessageRequest {
    @NotBlank
    String conversationId;

    String message;

    List<Attachment> attachments;
}
