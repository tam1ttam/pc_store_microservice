package com.devteria.order.dto.response;

import java.util.List;

import com.devteria.order.entity.CartItem;
import com.devteria.order.entity.OrderStatus;
import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class OrderResponse {
    String id;
    String customerId;
    String shipAddress;
    String orderDate;
    String currency;
    List<CartItem> items;
    double totalPrice;
    boolean isPaid;
    OrderStatus orderStatus;
}
