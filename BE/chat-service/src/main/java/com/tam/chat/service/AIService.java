package com.tam.chat.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.tam.chat.dto.request.ChatRequest;
import com.tam.chat.dto.response.AIResponse;
import com.tam.chat.entity.ProductCardPayload;
import com.tam.chat.repository.ProductQueryLogRepository;
import com.tam.chat.repository.grpc.ProductGrpcClient;
import com.tam.chat.repository.httpclient.VoucherClient;
import com.tam.proto.product.v1.ProductAttributeProto;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class AIService {

    private final RestTemplate restTemplate;
    private final ProductQueryLogRepository productQueryLogRepository;
    private final GeminiAiService geminiAiService;
    private final ProductGrpcClient productGrpcClient;
    private final VoucherClient voucherClient;

    @Value("${openrouter.api.key:}")
    private String apiKey;

    @Value("${openrouter.api.url:https://openrouter.ai/api/v1/chat/completions}")
    private String apiUrl;

    @Value("${openrouter.api.model:meta-llama/llama-3.3-70b-instruct}")
    private String model;

    @SuppressWarnings("unchecked")
    public AIResponse getAiResponse(ChatRequest request) {
        String userMessage = request.getMessage();
        String mode = request.getMode() != null ? request.getMode() : "chat";

        if (userMessage == null || userMessage.isBlank()) {
            return AIResponse.builder()
                    .success(false)
                    .error("Tin nhắn không được để trống")
                    .build();
        }

        if (request.getProductCard() != null) {
            return handleProductCard(request.getProductCard());
        }

        log.info("Calling AI in mode: {}, message length: {}", mode, userMessage.length());

        if (apiKey != null && !apiKey.isBlank() && !apiKey.contains("your-api-key")) {
            try {
                return callOpenRouter(userMessage, mode, "chat");
            } catch (Exception e) {
                log.warn("OpenRouter failed, falling back to Gemini: {}", e.getMessage());
            }
        }

        try {
            String geminiResponse = geminiAiService.processQuery(userMessage);
            return AIResponse.builder()
                    .success(true)
                    .response(geminiResponse)
                    .model("gemini")
                    .build();
        } catch (Exception e) {
            log.error("Gemini AI also failed: {}", e.getMessage());
            return AIResponse.builder()
                    .success(false)
                    .error(e.getMessage() != null ? e.getMessage() : "Lỗi kết nối AI")
                    .build();
        }
    }

    private AIResponse handleProductCard(ProductCardPayload card) {
        String productId = card.getProductId();
        log.info("Product card AI request for productId={}", productId);

        try {
            var product = productGrpcClient.getProduct(productId);
            if (product == null) {
                return AIResponse.builder()
                        .success(true)
                        .response(
                                "Sản phẩm này hiện không còn trong hệ thống. Bạn vui lòng liên hệ cửa hàng để biết thêm thông tin nhé!")
                        .build();
            }

            int stock = productGrpcClient.getRemainingStock(productId);
            List<ProductAttributeProto> attributes = productGrpcClient.getProductDetail(productId);

            var vouchers = voucherClient.getAllActiveVouchers();
            List<Map<String, Object>> applicable = List.of();
            if (vouchers != null && vouchers.getResult() != null) {
                LocalDateTime now = LocalDateTime.now();
                applicable = vouchers.getResult().stream()
                        .filter(v -> Boolean.TRUE.equals(v.getIsActive())
                                && (v.getExpiredAt() == null
                                        || !LocalDateTime.parse(v.getExpiredAt())
                                                .isBefore(now)))
                        .map(v -> Map.<String, Object>of(
                                "code", v.getCode(),
                                "description", v.getDescription() != null ? v.getDescription() : "",
                                "type", v.getAccessType() != null ? v.getAccessType() : "PUBLIC",
                                "discountAmount", v.getDiscountAmount(),
                                "discountPercent", v.getDiscountPercent(),
                                "expiredAt", v.getExpiredAt()))
                        .collect(Collectors.toList());
            }

            String response = buildProductCardResponse(product, stock, attributes, applicable);
            return AIResponse.builder()
                    .success(true)
                    .response(response)
                    .model("template")
                    .build();
        } catch (Exception e) {
            log.error("handleProductCard failed for productId={}", productId, e);
            return AIResponse.builder()
                    .success(false)
                    .error("Không thể lấy thông tin sản phẩm lúc này. Vui lòng thử lại sau.")
                    .build();
        }
    }

    private String buildProductCardResponse(
            com.tam.proto.product.v1.GetProductResponse product,
            int stock,
            List<ProductAttributeProto> attributes,
            List<Map<String, Object>> vouchers) {

        String stockStatus;
        if (stock < 0) {
            stockStatus = "Không kiểm tra được";
        } else if (stock == 0) {
            stockStatus = "Hết hàng";
        } else if (stock <= 5) {
            stockStatus = "Còn ít (chỉ còn " + stock + " sản phẩm)";
        } else {
            stockStatus = "Còn hàng (kho: " + stock + ")";
        }

        StringBuilder sb = new StringBuilder();
        sb.append("📦 **").append(product.getName()).append("**\n\n");

        if (product.getPrice() > 0) {
            sb.append("💰 **Giá:** ")
                    .append(String.format("%,.0f₫", product.getPrice()))
                    .append("\n");
        }
        if (product.getUnit() != null && !product.getUnit().isBlank()) {
            sb.append("📐 **Đơn vị:** ").append(product.getUnit()).append("\n");
        }
        if (product.getSupplier() != null
                && product.getSupplier().getName() != null
                && !product.getSupplier().getName().isBlank()) {
            sb.append("🏭 **Nhà cung cấp:** ")
                    .append(product.getSupplier().getName())
                    .append("\n");
        }

        sb.append("📊 **Tồn kho:** ").append(stockStatus).append("\n\n");

        if (attributes != null && !attributes.isEmpty()) {
            sb.append("🔧 **Thông số kỹ thuật:**\n");
            attributes.stream()
                    .filter(a -> a.getName() != null && !a.getName().isBlank())
                    .forEach(a -> {
                        String line = "- **" + a.getName() + ":** " + (a.getValue() != null ? a.getValue() : "—");
                        if (a.getUnit() != null && !a.getUnit().isBlank()) {
                            line += " " + a.getUnit();
                        }
                        sb.append(line).append("\n");
                    });
            sb.append("\n");
        }

        if (vouchers != null && !vouchers.isEmpty()) {
            sb.append("🎟️ **Voucher khuyến mãi hiện có (")
                    .append(vouchers.size())
                    .append("):**\n");
            vouchers.stream().limit(5).forEach(v -> {
                String desc = (String) v.get("description");
                String code = (String) v.get("code");
                String type = (String) v.get("type");
                sb.append("- `").append(code).append("` (");
                if (desc != null && !desc.isBlank()) sb.append(desc).append(" — ");
                sb.append(type.equals("PRIVATE") ? "Cá nhân" : "Công khai").append(")\n");
            });
            sb.append("\n");
        }

        sb.append("Bạn có muốn đặt hàng hoặc cần thêm thông tin gì không? 😊");
        return sb.toString();
    }

    private AIResponse callOpenRouter(String userMessage, String mode, String role) {
        String systemPrompt = getSystemPrompt(mode, role);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + apiKey);
        headers.set("HTTP-Referer", "http://localhost:3000");
        headers.set("X-Title", "PC Store AI Chatbot");

        Map<String, Object> body = Map.of(
                "model",
                model,
                "messages",
                List.of(
                        Map.of("role", "system", "content", systemPrompt),
                        Map.of("role", "user", "content", userMessage)),
                "max_tokens",
                500,
                "temperature",
                0.7);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
        ResponseEntity<Map> response = restTemplate.postForEntity(apiUrl, entity, Map.class);
        Map<String, Object> responseBody = response.getBody();

        if (responseBody == null) {
            throw new RuntimeException("Empty response from AI");
        }

        List<Map<String, Object>> choices = (List<Map<String, Object>>) responseBody.get("choices");
        if (choices == null || choices.isEmpty()) {
            throw new RuntimeException("AI returned no choices");
        }

        Map<String, Object> firstChoice = choices.get(0);
        Map<String, Object> message = (Map<String, Object>) firstChoice.get("message");
        String content = (String) message.get("content");

        productQueryLogRepository.save(com.tam.chat.entity.ProductQueryLog.builder()
                .userId("system")
                .createdAt(java.time.Instant.now())
                .productId("global")
                .build());

        return AIResponse.builder()
                .success(true)
                .response(content)
                .model((String) responseBody.get("model"))
                .usage((Map<String, Object>) responseBody.get("usage"))
                .build();
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
            return "Bạn là agent bán hàng thông minh. Nhiệm vụ:\n"
                    + "1. Trả lời câu hỏi về sản phẩm, giá, chất lượng\n"
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
