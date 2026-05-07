package com.tam.chat.controller;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.*;

import com.tam.chat.dto.ApiResponse;
import com.tam.chat.dto.request.AIRequest;
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
        String answer = aiService.processQuery(request.getQuestion());
        return ApiResponse.<AIResponse>builder()
                .result(AIResponse.builder().answer(answer).status("success").build())
                .build();
    }

    @GetMapping("/stats")
    ApiResponse<AIResponse> getStats() {
        String stats = aiService.processQuery("Cho tôi biết thống kê tổng quan về hệ thống PC Store");
        return ApiResponse.<AIResponse>builder()
                .result(AIResponse.builder().stats(stats).status("success").build())
                .build();
    }
}
