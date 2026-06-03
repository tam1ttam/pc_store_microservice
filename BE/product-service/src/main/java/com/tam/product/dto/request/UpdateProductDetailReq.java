package com.tam.product.dto.request;

import java.util.List;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateProductDetailReq {
    List<ProductAttributeRequest> attributes;
    List<String> images; // existing image URLs to keep (null = keep all)
    List<String> imagesUpload; // new files (base64) to upload and append
}
