package com.tam.chat.dto.response;

import java.util.Map;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AIResponse {
    private boolean success;
    private String response;
    private String model;
    private Map<String, Object> usage;
    private String error;
}
