package com.tam.order.dto.response;

import java.time.LocalDateTime;
import java.util.List;

import com.tam.order.entity.OrderStatus;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderResponse {
    Long id;
    String customerId;
    String identityUserId;
    String shipAddress;
    LocalDateTime orderDate;
    String currency;
    double totalPrice;
    boolean isPaid;
    OrderStatus orderStatus;
    List<OrderItemResponse> items;
}
