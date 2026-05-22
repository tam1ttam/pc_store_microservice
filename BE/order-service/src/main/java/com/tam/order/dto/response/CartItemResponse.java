package com.tam.order.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CartItemResponse {
    Long id;
    String productId;
    String productName;
    double productPrice;
    String productImage;
    int quantity;
    double subtotal;
}
