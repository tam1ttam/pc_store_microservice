package com.tam.order.service;

import java.util.Optional;

import com.tam.order.dto.request.PaymentRequest;
import com.tam.order.dto.response.PaymentResponse;
import com.tam.order.entity.Payment;

public interface PaymentService {
    PaymentResponse createPayment(PaymentRequest request) throws Exception;

    Optional<Payment> getPaymentByPaymentId(String paymentId);

    Optional<Payment> getPaymentByOrderId(String orderId);

    Payment updatePaymentStatus(String paymentId, String status);

    boolean executePayment(String paymentId);

    boolean cancelPayment(String paymentId);
}
