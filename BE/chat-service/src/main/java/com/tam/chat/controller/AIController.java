package com.tam.chat.controller;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.*;

import com.tam.chat.dto.ApiResponse;
import com.tam.chat.dto.request.AIRequest;
import com.tam.chat.dto.request.ChatRequest;
import com.tam.chat.dto.response.AIResponse;
import com.tam.chat.service.AIService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequiredArgsConstructor
@RequestMapping("ai")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AIController {
    AIService aiService;

    @PostMapping("/ask")
    ApiResponse<AIResponse> ask(@RequestBody @Valid AIRequest request) {
        AIResponse response = aiService.getAiResponse(ChatRequest.builder()
                .message(request.getQuestion())
                .mode("chat")
                .build());
        return ApiResponse.<AIResponse>builder().result(response).build();
    }

    @GetMapping("/stats")
    ApiResponse<AIResponse> getStats() {
        AIResponse response = aiService.getAiResponse(ChatRequest.builder()
                .message("Cho tôi biết thống kê tổng quan về hệ thống PC Store")
                .mode("chat")
                .build());
        return ApiResponse.<AIResponse>builder().result(response).build();
    }
}
