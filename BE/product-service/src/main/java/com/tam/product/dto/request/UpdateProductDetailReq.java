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
    String processor;
    String ram;
    String storage;
    String graphicsCard;
    String powerSupply;
    String motherboard;
    String case_;
    String coolingSystem;
    String operatingSystem;
    List<String> imagesUpload;
}
