package com.tam.product.dto.response;

import java.util.ArrayList;
import java.util.List;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductDetailResponse {
    String productId;

    @Builder.Default
    List<ProductAttributeResponse> attributes = new ArrayList<>();

    List<String> images;
}
