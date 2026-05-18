package com.tam.order.controller;

import java.util.Locale;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.web.bind.annotation.*;

import com.tam.order.dto.request.ApiResponse;
import com.tam.order.dto.request.PaymentRequest;
import com.tam.order.dto.response.PaymentResponse;
import com.tam.order.service.PaymentService;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@RestController
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Slf4j
@RequestMapping("/api/payment")
public class PaymentController {
    PaymentService paymentService;

    @PostMapping("/create_payment")
    public ApiResponse<?> createPayment(HttpServletRequest request, @RequestBody PaymentRequest paymentRequest)
            throws Exception {
        // TODO: Tích hợp PayPal SDK
        // Double totalAmount = Double.parseDouble(paymentRequest.getAmount()) / 26000;
        // String currency = "USD";
        // Payment payment = new Payment();
        // payment.create(apiContext);

        PaymentResponse payment = paymentService.createPayment(paymentRequest);
        String redirectUrl =
                String.format(Locale.US, "https://www.sandbox.paypal.com/checkoutnow?token=%s", payment.getPaymentId());
        payment.setUrl(redirectUrl);

        return ApiResponse.builder()
                .code(1000)
                .message("Payment created successfully")
                .result(payment)
                .build();
    }

    @GetMapping("/return/{id}")
    public ApiResponse<?> returnPayment(@PathVariable String id) {
        try {
            // TODO: Xử lý return từ PayPal - cập nhật order status thành PAID
            // PayPal sẽ redirect tới đây với token
            // Gọi PayPal execute payment API

            paymentService.executePayment(id);
            return ApiResponse.builder()
                    .code(1000)
                    .message("Payment executed successfully")
                    .result(true)
                    .build();
        } catch (Exception e) {
            log.error("Error executing payment: {}", e.getMessage());
            return ApiResponse.builder()
                    .code(9999)
                    .message("Payment execution failed: " + e.getMessage())
                    .result(false)
                    .build();
        }
    }

    @GetMapping("/cancel/{id}")
    public ApiResponse<?> cancelPayment(@PathVariable String id) {
        try {
            // TODO: Xử lý cancel từ PayPal - cập nhật payment status thành CANCELLED
            paymentService.cancelPayment(id);
            return ApiResponse.builder()
                    .code(1000)
                    .message("Payment cancelled successfully")
                    .result(true)
                    .build();
        } catch (Exception e) {
            log.error("Error cancelling payment: {}", e.getMessage());
            return ApiResponse.builder()
                    .code(9999)
                    .message("Payment cancellation failed: " + e.getMessage())
                    .result(false)
                    .build();
        }
    }

    @GetMapping("/{paymentId}")
    public ApiResponse<?> getPayment(@PathVariable String paymentId) {
        return paymentService
                .getPaymentByPaymentId(paymentId)
                .map(payment -> ApiResponse.builder().code(1000).result(payment).build())
                .orElseGet(() -> ApiResponse.builder()
                        .code(404)
                        .message("Payment not found")
                        .build());
    }

    @GetMapping("/order/{orderId}")
    public ApiResponse<?> getPaymentByOrder(@PathVariable String orderId) {
        return paymentService
                .getPaymentByOrderId(orderId)
                .map(payment -> ApiResponse.builder().code(1000).result(payment).build())
                .orElseGet(() -> ApiResponse.builder()
                        .code(404)
                        .message("Payment not found for this order")
                        .build());
    }
}
