package com.tam.order.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.tam.order.entity.Payment;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Payment findPaymentsByPaymentId(String paymentId);

    Optional<Payment> findByOrderId(String orderId);
}
