package com.tam.chat.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.tam.chat.dto.request.ChatRequest;
import com.tam.chat.dto.response.AIResponse;
import com.tam.chat.repository.ProductQueryLogRepository;
import com.tam.chat.service.AIService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final AIService aiService;
    private final ProductQueryLogRepository productQueryLogRepository;

    @PostMapping
    public ResponseEntity<AIResponse> chat(@RequestBody ChatRequest request) {
        log.info("AI Chat Request: message={}, mode={}", request.getMessage(), request.getMode());
        AIResponse response = aiService.getAiResponse(request);

        if (!response.isSuccess()) {
            return ResponseEntity.internalServerError().body(response);
        }

        return ResponseEntity.ok(response);
    }

    @GetMapping("/analytics/top-asked")
    public ResponseEntity<List<ProductQueryLogRepository.ProductCount>> getTopAskedProducts() {
        return ResponseEntity.ok(productQueryLogRepository.getTopAskedProducts());
    }
}
