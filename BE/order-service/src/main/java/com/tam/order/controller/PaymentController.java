package com.tam.order.controller;

import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.tam.order.dto.request.SePayWebhookRequest;
import com.tam.order.service.OrderService;

import lombok.extern.slf4j.Slf4j;

@RestController
@Slf4j
@RequestMapping("/api/payment")
public class PaymentController {
    private final OrderService orderService;
    private final String apiKey;

    public PaymentController(OrderService orderService, @Value("${sepay.api-key}") String apiKey) {
        this.orderService = orderService;
        this.apiKey = apiKey;
    }

    @PostMapping("/webhook/sepay")
    public ResponseEntity<?> sePayWebhook(
            @RequestHeader("Authorization") String auth, @RequestBody SePayWebhookRequest payload) {

        log.info("Received SePay webhook: payload={}", payload);

        // 1. Xác thực API key
        if (!auth.equals("Apikey " + apiKey)) {
            log.warn("Unauthorized SePay webhook attempt: auth={}", auth);
            return ResponseEntity.status(401).build();
        }

        // 2. Chỉ xử lý tiền VÀO
        if (!"in".equals(payload.getTransferType())) {
            return ResponseEntity.ok(Map.of("success", true));
        }

        // 3. Bóc tách mã đơn hàng từ nội dung
        // content: "PCSTORE123" -> orderId = 123
        Pattern pattern = Pattern.compile("PCSTORE(\\d+)");
        Matcher matcher = pattern.matcher(payload.getContent());
        if (!matcher.find()) {
            log.warn("SePay webhook: Could not find order ID in content: {}", payload.getContent());
            return ResponseEntity.ok(Map.of("success", false, "message", "Không tìm thấy mã đơn hàng"));
        }

        try {
            Long orderId = Long.parseLong(matcher.group(1));
            // 4. Kiểm tra order + số tiền khớp -> cập nhật PAID
            orderService.confirmPayment(orderId, payload.getTransferAmount());
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            log.error("Error confirming payment via SePay for content {}: {}", payload.getContent(), e.getMessage());
            return ResponseEntity.ok(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
