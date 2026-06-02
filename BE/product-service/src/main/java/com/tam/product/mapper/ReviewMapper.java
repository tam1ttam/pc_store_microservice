package com.tam.product.mapper;

import java.util.List;

import org.bson.types.ObjectId;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.tam.product.dto.request.ReviewCreationRequest;
import com.tam.product.dto.request.ReviewUpdateRequest;
import com.tam.product.dto.response.ProductRatingResponse;
import com.tam.product.dto.response.ReviewResponse;
import com.tam.product.entity.Review;

@Mapper(componentModel = "spring")
public interface ReviewMapper {

    default String map(ObjectId value) {
        return value != null ? value.toHexString() : null;
    }

    @Mapping(target = "identityUserId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "id", ignore = true)
    Review toReview(ReviewCreationRequest request);

    @Mapping(target = "identityUserId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "productId", ignore = true)
    @Mapping(target = "orderId", ignore = true)
    Review toReview(ReviewUpdateRequest request);

    ReviewResponse toReviewResponse(Review review);

    default ProductRatingResponse toProductRatingResponse(List<Review> reviews) {
        if (reviews == null || reviews.isEmpty()) {
            return ProductRatingResponse.builder()
                    .averageRating(0.0)
                    .reviewCount(0L)
                    .build();
        }
        double avg = reviews.stream().mapToInt(Review::getRating).average().orElse(0.0);
        return ProductRatingResponse.builder()
                .averageRating(avg)
                .reviewCount((long) reviews.size())
                .build();
    }
}
