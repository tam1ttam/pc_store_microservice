package com.tam.chat.service;

import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.tam.chat.dto.request.ChatRequest;
import com.tam.chat.dto.response.AIResponse;
import com.tam.chat.entity.ProductCardPayload;
import com.tam.chat.repository.ProductQueryLogRepository;
import com.tam.chat.repository.grpc.ProductGrpcClient;
import com.tam.chat.repository.grpc.VoucherGrpcClient;
import com.tam.proto.product.v1.GetProductResponse;
import com.tam.proto.product.v1.ProductAttributeProto;
import com.tam.proto.voucher.v1.VoucherResponse;

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
    private final VoucherGrpcClient voucherGrpcClient;

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

        if ("productSent".equalsIgnoreCase(mode)) {
            return handleProductSent(request);
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

    private AIResponse handleProductSent(ChatRequest request) {
        String productId = null;
        String productName = request.getMessage();

        if (request.getProductCard() != null && request.getProductCard().getProductId() != null) {
            productId = request.getProductCard().getProductId();
        }

        String userId = getCurrentUserId();
        log.info("ProductSent mode: productId={}, productName={}, userId={}", productId, productName, userId);

        try {
            GetProductResponse product = null;
            if (productId != null) {
                product = productGrpcClient.getProduct(productId);
            }
            if (product == null && productName != null && !productName.isBlank()) {
                product = productGrpcClient.getProductByName(productName);
            }
            if (product == null) {
                return AIResponse.builder()
                        .success(true)
                        .response(
                                "Sản phẩm này hiện không còn trong hệ thống. Bạn vui lòng liên hệ cửa hàng để biết thêm thông tin nhé!")
                        .model("template")
                        .build();
            }

            int stock = productGrpcClient.getRemainingStock(product.getId());
            List<ProductAttributeProto> attributes = productGrpcClient.getProductDetail(product.getId());

            List<VoucherResponse> vouchers = List.of();
            if (userId != null) {
                vouchers = voucherGrpcClient.getActiveVouchers(userId);
            }

            String response = buildProductSentResponse(product, stock, attributes, vouchers);
            return AIResponse.builder()
                    .success(true)
                    .response(response)
                    .model("template")
                    .build();

        } catch (Exception e) {
            log.error("handleProductSent failed", e);
            return AIResponse.builder()
                    .success(false)
                    .error("Không thể lấy thông tin sản phẩm lúc này. Vui lòng thử lại sau.")
                    .build();
        }
    }

    private String buildProductSentResponse(
            GetProductResponse product,
            int stock,
            List<ProductAttributeProto> attributes,
            List<VoucherResponse> vouchers) {

        double basePrice = product.getPrice();
        double bestFinalPrice = basePrice;
        VoucherResponse bestVoucher = null;

        for (VoucherResponse v : vouchers) {
            if (!v.getIsActive()) continue;
            double discount = 0;
            if (v.getDiscountAmount() > 0) {
                discount = v.getDiscountAmount();
            } else if (v.getDiscountPercent() > 0) {
                discount = basePrice * v.getDiscountPercent() / 100.0;
            }
            double finalPrice = Math.max(0, basePrice - discount);
            if (finalPrice < bestFinalPrice || bestVoucher == null) {
                bestFinalPrice = finalPrice;
                bestVoucher = v;
            }
        }

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

        sb.append("💰 **Giá gốc:** ").append(String.format("%,.0f₫", basePrice)).append("\n");
        if (bestVoucher != null && bestFinalPrice < basePrice) {
            sb.append("🏷️ **Giá sau voucher:** ")
                    .append(String.format("%,.0f₫", bestFinalPrice))
                    .append("\n");
            String voucherLabel = bestVoucher.getCode();
            sb.append(" (Áp dụng: ").append(voucherLabel);
            if (bestVoucher.getDiscountPercent() > 0) {
                sb.append(" -").append(bestVoucher.getDiscountPercent()).append("%");
            } else if (bestVoucher.getDiscountAmount() > 0) {
                sb.append(" -").append(String.format("%,.0f₫", bestVoucher.getDiscountAmount()));
            }
            sb.append(")\n");
        } else {
            sb.append("💵 **Giá bán:** ")
                    .append(String.format("%,.0f₫", basePrice))
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

        if (bestFinalPrice < basePrice) {
            sb.append("🎉 Bạn đang có voucher giảm giá cho sản phẩm này! ");
        }
        sb.append("Bạn có muốn đặt hàng hoặc cần thêm thông tin gì không? 😊");
        return sb.toString();
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
            String response = buildProductCardResponse(product, stock, attributes);
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
            GetProductResponse product, int stock, List<ProductAttributeProto> attributes) {

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

    private String getCurrentUserId() {
        try {
            var auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getName() != null) {
                return auth.getName();
            }
        } catch (Exception e) {
            log.debug("Cannot get current user id: {}", e.getMessage());
        }
        return null;
    }
}
