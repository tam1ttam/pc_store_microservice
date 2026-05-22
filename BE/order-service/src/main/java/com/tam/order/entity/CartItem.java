package com.tam.order.entity;

import jakarta.persistence.*;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "cart_items")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CartItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_id", nullable = false)
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    Cart cart;

    @Column(name = "product_id", nullable = false)
    String productId;

    @Column(name = "product_name")
    String productName;

    @Column(name = "product_price")
    double productPrice;

    @Column(name = "product_image", columnDefinition = "TEXT")
    String productImage;

    int quantity;
}
