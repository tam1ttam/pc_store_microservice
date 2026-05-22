package com.tam.order.entity;

import jakarta.persistence.*;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @Column(name = "payment_id", unique = true)
    String paymentId;

    @Column(name = "user_id")
    String userId;

    @Column(name = "identity_user_id")
    String identityUserId;

    @Column(name = "payment_method")
    String paymentMethod;

    @Column(name = "order_id")
    String orderId;

    Double amount;
    String currency;
    String description;
    String status;
}
