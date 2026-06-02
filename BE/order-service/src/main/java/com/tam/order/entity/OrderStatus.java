package com.tam.order.entity;

import lombok.Getter;

@Getter
public enum OrderStatus {
    PENDING("Chờ thanh toán"),
    PAID("Đã thanh toán"),
    DELIVERING("Đang giao hàng"),
    DELIVERED("Đã giao hàng"),
    CANCELLED("Đã hủy");

    private final String status;

    OrderStatus(String status) {
        this.status = status;
    }
}
