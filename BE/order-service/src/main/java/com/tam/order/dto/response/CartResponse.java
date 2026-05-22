package com.tam.order.dto.response;

import java.util.List;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CartResponse {
    Long id;
    String identityUserId;
    List<CartItemResponse> items;
    int totalItems;
    double totalPrice;
}
