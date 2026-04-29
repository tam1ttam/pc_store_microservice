package com.devteria.order.service;

import java.util.Optional;

import com.devteria.order.dto.request.PaymentRequest;
import com.devteria.order.dto.response.PaymentResponse;
import com.devteria.order.entity.Payment;

public interface PaymentService {
    PaymentResponse createPayment(PaymentRequest request) throws Exception;

    Optional<Payment> getPaymentByPaymentId(String paymentId);

    Optional<Payment> getPaymentByOrderId(String orderId);

    Payment updatePaymentStatus(String paymentId, String status);

    boolean executePayment(String paymentId);

    boolean cancelPayment(String paymentId);
}
