package com.tam.chat.dto.request;

import com.tam.chat.entity.ProductCardPayload;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatRequest {
    private String message;
    private String mode;
    private String role;
    private ProductCardPayload productCard;
}
