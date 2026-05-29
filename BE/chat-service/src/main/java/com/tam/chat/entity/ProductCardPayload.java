package com.tam.chat.entity;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductCardPayload {
    private String productId;
    private String name;
    private Double price;
    private String image;
    private String slug;
}
