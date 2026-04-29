package com.devteria.order.service.impl;

import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.devteria.order.dto.request.PaymentRequest;
import com.devteria.order.dto.response.PaymentResponse;
import com.devteria.order.entity.Payment;
import com.devteria.order.entity.PaymentStatus;
import com.devteria.order.mapper.PaymentMapper;
import com.devteria.order.repository.PaymentRepository;
import com.devteria.order.service.PaymentService;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;

@Service
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PaymentServiceImpl implements PaymentService {
    PaymentRepository paymentRepository;
    PaymentMapper paymentMapper;

    @NonFinal
    @Value("${paypal.cancel-url:http://localhost:3000/cancel}")
    private String cancelUrl;

    @NonFinal
    @Value("${paypal.return-url:http://localhost:3000/success}")
    private String returnUrl;

    @Override
    public PaymentResponse createPayment(PaymentRequest request) throws Exception {
        // TODO: Tích hợp PayPal API để tạo payment
        // Double totalAmount = Double.parseDouble(request.getAmount()) / 26000;
        // Payment payment = new Payment();
        // payment.create(apiContext);

        String paymentId = UUID.randomUUID().toString();
        Payment payment = Payment.builder()
                .paymentId(paymentId)
                .userId(request.getUserId())
                .paymentMethod(request.getPaymentMethod())
                .amount(Double.parseDouble(request.getAmount()))
                .currency("VND")
                .description(request.getDescription())
                .status(PaymentStatus.CREATED.toString())
                .build();

        Payment savedPayment = paymentRepository.save(payment);
        return paymentMapper.toPaymentResponse(savedPayment);
    }

    @Override
    public Optional<Payment> getPaymentByPaymentId(String paymentId) {
        return Optional.ofNullable(paymentRepository.findPaymentsByPaymentId(paymentId));
    }

    @Override
    public Optional<Payment> getPaymentByOrderId(String orderId) {
        return Optional.ofNullable(paymentRepository.findByOrderId(orderId));
    }

    @Override
    public Payment updatePaymentStatus(String paymentId, String status) {
        Payment payment = paymentRepository.findPaymentsByPaymentId(paymentId);
        if (payment != null) {
            payment.setStatus(status);
            return paymentRepository.save(payment);
        }
        throw new RuntimeException("Payment not found");
    }

    @Override
    public boolean executePayment(String paymentId) {
        // TODO: Thực thi thanh toán qua PayPal
        // 1. Gọi PayPal execute payment API
        // 2. Cập nhật payment status thành APPROVED
        // 3. Cập nhật order status thành PAID
        // 4. Gửi email xác nhận

        Payment payment = paymentRepository.findPaymentsByPaymentId(paymentId);
        if (payment != null) {
            payment.setStatus(PaymentStatus.APPROVED.toString());
            paymentRepository.save(payment);
            return true;
        }
        return false;
    }

    @Override
    public boolean cancelPayment(String paymentId) {
        // TODO: Hủy thanh toán trên PayPal
        Payment payment = paymentRepository.findPaymentsByPaymentId(paymentId);
        if (payment != null) {
            payment.setStatus(PaymentStatus.CANCELLED.toString());
            paymentRepository.save(payment);
            return true;
        }
        return false;
    }
}
