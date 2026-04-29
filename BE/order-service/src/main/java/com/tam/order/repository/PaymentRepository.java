package com.devteria.order.repository;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import com.devteria.order.entity.Payment;

@Repository
public interface PaymentRepository extends MongoRepository<Payment, ObjectId> {
    Payment findPaymentsByPaymentId(String paymentId);

    @Query("{ 'order_id': ?0 }")
    Payment findByOrderId(String orderId);

    @Query("{ 'user_id': ?0 }")
    Payment findByUserId(String userId);
}
