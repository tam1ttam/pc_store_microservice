package com.tam.chat.dto.request;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatRequest {
    private String message;
    private String mode;
    private String role; // "chat" or "agent"
}
