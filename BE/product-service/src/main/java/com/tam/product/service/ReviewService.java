package com.tam.product.service;

import java.util.List;

import com.tam.product.dto.request.ReviewCreationRequest;
import com.tam.product.dto.request.ReviewUpdateRequest;
import com.tam.product.dto.response.ProductRatingResponse;
import com.tam.product.dto.response.ReviewResponse;

public interface ReviewService {

    ReviewResponse createReview(String identityUserId, ReviewCreationRequest request);

    ReviewResponse updateReview(String reviewId, String identityUserId, ReviewUpdateRequest request);

    void deleteReview(String reviewId);

    List<ReviewResponse> getReviewsByProductId(String productId);

    ProductRatingResponse getProductRating(String productId);
}
