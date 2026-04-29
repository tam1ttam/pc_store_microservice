package com.devteria.order.entity;

import lombok.Getter;

@Getter
public enum OrderStatus {
    DELIVERING("Đang giao hàng"),
    DELIVERED("Đã giao hàng"),
    CANCELLED("Đã hủy");

    private final String status;

    OrderStatus(String status) {
        this.status = status;
    }
}
