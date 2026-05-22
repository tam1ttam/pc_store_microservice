package com.tam.order.service.impl;

import java.util.Optional;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.devteria.event.dto.StoreNotificationEvent;
import com.tam.order.dto.request.PaymentRequest;
import com.tam.order.dto.response.PaymentResponse;
import com.tam.order.entity.Payment;
import com.tam.order.entity.PaymentStatus;
import com.tam.order.mapper.PaymentMapper;
import com.tam.order.repository.PaymentRepository;
import com.tam.order.service.PaymentService;

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
    KafkaTemplate<String, Object> kafkaTemplate;

    @NonFinal
    @Value("${paypal.cancel-url:http://localhost:3000/cancel}")
    private String cancelUrl;

    @NonFinal
    @Value("${paypal.return-url:http://localhost:3000/success}")
    private String returnUrl;

    @Override
    public PaymentResponse createPayment(PaymentRequest request) throws Exception {
        String paymentId = UUID.randomUUID().toString();
        Payment payment = Payment.builder()
                .paymentId(paymentId)
                .userId(request.getUserId())
                .identityUserId(request.getIdentityUserId())
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
        return paymentRepository.findByOrderId(orderId);
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
        Payment payment = paymentRepository.findPaymentsByPaymentId(paymentId);
        if (payment == null) return false;

        payment.setStatus(PaymentStatus.APPROVED.toString());
        paymentRepository.save(payment);

        if (payment.getIdentityUserId() != null && !payment.getIdentityUserId().isBlank()) {
            kafkaTemplate.send(
                    "notification.store",
                    StoreNotificationEvent.builder()
                            .userId(payment.getIdentityUserId())
                            .type("ORDER_PLACED")
                            .title("Thanh toán thành công")
                            .body(String.format(
                                    "Thanh toán PayPal của bạn đã được xác nhận. Tổng tiền: %.0f VNĐ.",
                                    payment.getAmount()))
                            .isSystem(false)
                            .actionRequired(false)
                            .referenceId(payment.getPaymentId())
                            .referenceType("PAYMENT")
                            .build());
        }
        return true;
    }

    @Override
    public boolean cancelPayment(String paymentId) {
        Payment payment = paymentRepository.findPaymentsByPaymentId(paymentId);
        if (payment == null) return false;

        payment.setStatus(PaymentStatus.CANCELLED.toString());
        paymentRepository.save(payment);

        if (payment.getIdentityUserId() != null && !payment.getIdentityUserId().isBlank()) {
            kafkaTemplate.send(
                    "notification.store",
                    StoreNotificationEvent.builder()
                            .userId(payment.getIdentityUserId())
                            .type("PAYMENT_FAILED")
                            .title("Thanh toán thất bại")
                            .body("Thanh toán PayPal của bạn đã bị huỷ.")
                            .isSystem(false)
                            .actionRequired(false)
                            .referenceId(payment.getPaymentId())
                            .referenceType("PAYMENT")
                            .build());
        }
        return true;
    }
}
