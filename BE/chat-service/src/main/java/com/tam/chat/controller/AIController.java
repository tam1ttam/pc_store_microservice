package com.tam.chat.controller;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import com.tam.chat.dto.ApiResponse;
import com.tam.chat.dto.request.AIRequest;
import com.tam.chat.dto.request.ChatRequest;
import com.tam.chat.dto.response.AIResponse;
import com.tam.chat.dto.response.ChatMessageResponse;
import com.tam.chat.service.AIService;
import com.tam.chat.service.ChatMessageService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequiredArgsConstructor
@RequestMapping("ai")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AIController {
    AIService aiService;
    ChatMessageService chatMessageService;

    @PostMapping("/ask")
    ApiResponse<AIResponse> ask(@RequestBody @Valid AIRequest request) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();

        // 1. Save User message to DB
        chatMessageService.saveAiMessage(userId, request.getQuestion(), userId, "You");

        AIResponse response = aiService.getAiResponse(ChatRequest.builder()
                .message(request.getQuestion())
                .mode("chat")
                .build());

        // 2. Save AI response message to DB if successful
        if (response.isSuccess()) {
            chatMessageService.saveAiMessage(userId, response.getResponse(), "AI_ASSISTANT", "AI Assistant");
        }

        return ApiResponse.<AIResponse>builder().result(response).build();
    }

    @GetMapping("/history")
    ApiResponse<List<ChatMessageResponse>> getHistory() {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return ApiResponse.<List<ChatMessageResponse>>builder()
                .result(chatMessageService.getAiHistory(userId))
                .build();
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
