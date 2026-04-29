package com.devteria.order.dto.request;

import java.util.List;

import com.devteria.order.entity.CartItem;
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
public class OrderCreationRequest {
    String customerId;
    String shipAddress;
    List<CartItem> items;
    double totalPrice;
    String orderDate;
    String isPaid;
    String orderStatus;
}
