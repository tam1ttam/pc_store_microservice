package com.tam.order.dto.response;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.tam.order.entity.CartItem;
import com.tam.order.entity.OrderStatus;

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
