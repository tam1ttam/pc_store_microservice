package com.tam.product.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProductRatingResponse {

    private double averageRating;
    private long reviewCount;
}
