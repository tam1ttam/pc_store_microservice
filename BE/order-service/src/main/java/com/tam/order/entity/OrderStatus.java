package com.tam.order.entity;

import lombok.Getter;

@Getter
public enum OrderStatus {
    CART("Giỏ hàng"), // 👉 Thêm dòng này vào đầu
    DELIVERING("Đang giao hàng"),
    DELIVERED("Đã giao hàng"),
    CANCELLED("Đã hủy");

    private final String status;

    OrderStatus(String status) {
        this.status = status;
    }
}
