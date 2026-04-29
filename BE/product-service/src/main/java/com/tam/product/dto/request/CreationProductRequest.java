package com.tam.product.dto.request;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.tam.product.entity.Supplier;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CreationProductRequest {
    String name;
    String img;
    double priceAfterDiscount;
    double originalPrice;
    double discountPercent;
    double priceDiscount;
    int inStock;
    Supplier supplier;
}
