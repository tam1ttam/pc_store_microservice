package com.tam.chat.service;

import java.util.*;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.tam.chat.dto.request.ChatRequest;
import com.tam.chat.dto.response.AIResponse;
import com.tam.chat.entity.ProductQueryLog;
import com.tam.chat.repository.ProductQueryLogRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AIService {

    private final RestTemplate restTemplate;
    private final ProductQueryLogRepository productQueryLogRepository;

    @Value("${openrouter.api.key}")
    private String apiKey;

    @Value("${openrouter.api.url}")
    private String apiUrl;

    @Value("${openrouter.api.model}")
    private String model;

    @SuppressWarnings("unchecked")
    public AIResponse getAiResponse(ChatRequest request) {
        String mode = request.getMode() != null ? request.getMode() : "chat";
        String systemPrompt = getSystemPrompt(mode, request.getRole());

        log.info("Calling OpenRouter AI in mode: {}, role: {}", mode, request.getRole());

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + apiKey);
            headers.set("HTTP-Referer", "http://localhost:3000");
            headers.set("X-Title", "PC Store AI Chatbot");

            Map<String, Object> body = new HashMap<>();
            body.put("model", model);
            body.put(
                    "messages",
                    List.of(
                            Map.of("role", "system", "content", systemPrompt),
                            Map.of("role", "user", "content", request.getMessage())));
            body.put("max_tokens", 500);
            body.put("temperature", 0.7);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(apiUrl, entity, Map.class);
            Map<String, Object> responseBody = response.getBody();

            if (responseBody == null) throw new RuntimeException("Empty response from AI");

            List<Map<String, Object>> choices = (List<Map<String, Object>>) responseBody.get("choices");
            if (choices == null || choices.isEmpty()) {
                throw new RuntimeException("AI returned no choices");
            }

            Map<String, Object> firstChoice = choices.get(0);
            Map<String, Object> message = (Map<String, Object>) firstChoice.get("message");
            String content = (String) message.get("content");

            // Log product query if content mentions a product (simplistic approach)
            // In real world, AI would return a list of mentioned product IDs
            productQueryLogRepository.save(ProductQueryLog.builder()
                    .userId("system")
                    .createdAt(java.time.Instant.now())
                    .productId("global") // We would extract actual PID here
                    .build());

            return AIResponse.builder()
                    .success(true)
                    .response(content)
                    .model((String) responseBody.get("model"))
                    .usage((Map<String, Object>) responseBody.get("usage"))
                    .build();

        } catch (Exception e) {
            log.error("AI Service Error: {}", e.getMessage());
            return AIResponse.builder().success(false).error(e.getMessage()).build();
        }
    }

    private String getSystemPrompt(String mode, String role) {
        if ("MANAGER".equalsIgnoreCase(role)) {
            return "Bạn là Trợ lý Quản lý thông minh của PC Store. Nhiệm vụ của bạn:\n"
                    + "1. Phân tích dữ liệu kinh doanh, doanh thu và hiệu suất bán hàng\n"
                    + "2. Cảnh báo về tồn kho thấp hoặc sản phẩm bán chậm\n"
                    + "3. Gợi ý chiến lược khuyến mãi dựa trên xu hướng khách hàng\n"
                    + "4. Hỗ trợ tra cứu nhanh thông tin khách hàng và trạng thái đơn hàng\n\n"
                    + "Quy tắc:\n"
                    + "- Cung cấp thông tin mang tính phân tích, chiến lược và súc tích\n"
                    + "- Sử dụng ngôn ngữ chuyên nghiệp, tập trung vào hiệu quả quản lý\n"
                    + "- Nếu dữ liệu không đủ, hãy gợi ý manager cần kiểm tra báo cáo chi tiết nào";
        }

        if ("agent".equalsIgnoreCase(mode)) {
            return "Bạn là agent bán hàng thông minh. Nhiệm vụ:\n" + "1. Trả lời câu hỏi về sản phẩm, giá, chất lượng\n"
                    + "2. Hỗ trợ tìm size/màu/số lượng\n"
                    + "3. Đề xuất sản phẩm liên quan\n"
                    + "4. Hướng dẫn đặt hàng\n\n"
                    + "Quy tắc:\n"
                    + "- Luôn thân thiện, chuyên nghiệp\n"
                    + "- Nếu không biết, nói \"Tôi cần kiểm tra lại\" không tự ý bịa\n"
                    + "- Câu trả lời ngắn gọn, dễ hiểu";
        }
        return "Bạn là trợ lý dịch vụ khách hàng. Trả lời ngắn gọn, thân thiện, hữu ích, chính xác, tự nhiên như người thật.";
    }
}
