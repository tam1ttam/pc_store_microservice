package com.tam.product.dto.request;

import com.tam.product.entity.Supplier;

import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

@Data
@SuperBuilder
@AllArgsConstructor
@NoArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductCreationRequest {

    String name;
    String img;
    double price;
    String unit;
    int inStock;
    Supplier supplier;
    ProductDetailCreationRequest productDetailCreationRequest;
}
