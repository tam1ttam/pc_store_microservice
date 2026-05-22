package com.tam.order.dto.request;

import java.util.List;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class OrderCreationRequest {
    String customerId;
    String identityUserId;
    String customerEmail;
    String customerName;
    String shipAddress;
    List<CartItemRequest> items;
    double totalPrice;
    String orderDate;
    String isPaid;
    String orderStatus;
}
