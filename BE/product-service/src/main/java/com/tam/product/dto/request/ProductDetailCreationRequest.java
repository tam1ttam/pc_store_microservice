package com.tam.product.dto.request;

import java.util.ArrayList;
import java.util.List;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductDetailCreationRequest {

    String productId;

    @Builder.Default
    List<ProductAttributeRequest> attributes = new ArrayList<>();

    List<String> images; // pre-uploaded URLs (set internally before DB save)
    List<String> imagesUpload; // raw base64 from client
}
