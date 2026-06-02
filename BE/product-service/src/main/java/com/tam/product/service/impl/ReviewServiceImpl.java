package com.tam.product.service.impl;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.tam.product.dto.request.ReviewCreationRequest;
import com.tam.product.dto.request.ReviewUpdateRequest;
import com.tam.product.dto.response.ProductRatingResponse;
import com.tam.product.dto.response.ReviewResponse;
import com.tam.product.entity.Review;
import com.tam.product.mapper.ReviewMapper;
import com.tam.product.repository.ReviewRepository;
import com.tam.product.service.ReviewService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final ReviewMapper reviewMapper;
    private final MongoTemplate mongoTemplate;

    @Override
    public ReviewResponse createReview(String identityUserId, ReviewCreationRequest request) {
        if (!StringUtils.hasText(request.getProductId()) || !StringUtils.hasText(request.getOrderId())) {
            throw new RuntimeException("PRODUCT_ID_AND_ORDER_ID_REQUIRED");
        }

        boolean exists = reviewRepository.existsByIdentityUserIdAndOrderIdAndProductId(
                identityUserId, request.getOrderId(), request.getProductId());
        if (exists) {
            throw new RuntimeException("REVIEW_ALREADY_EXISTS");
        }

        Review review = reviewMapper.toReview(request);
        review.setIdentityUserId(identityUserId);
        review.setCreatedAt(LocalDateTime.now());
        review.setUpdatedAt(LocalDateTime.now());

        Review saved = reviewRepository.save(review);
        log.info(
                "Review created: reviewId={}, productId={}, userId={}, rating={}",
                saved.getId(),
                saved.getProductId(),
                identityUserId,
                saved.getRating());
        return reviewMapper.toReviewResponse(saved);
    }

    @Override
    public ReviewResponse updateReview(String reviewId, String identityUserId, ReviewUpdateRequest request) {
        Review review = reviewRepository
                .findById(new ObjectId(reviewId))
                .orElseThrow(() -> new RuntimeException("REVIEW_NOT_FOUND"));

        if (!review.getIdentityUserId().equals(identityUserId)) {
            throw new RuntimeException("NOT_YOUR_REVIEW");
        }

        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review.setUpdatedAt(LocalDateTime.now());

        Review saved = reviewRepository.save(review);
        log.info("Review updated: reviewId={}, userId={}", reviewId, identityUserId);
        return reviewMapper.toReviewResponse(saved);
    }

    @Override
    public void deleteReview(String reviewId) {
        if (!reviewRepository.existsById(new ObjectId(reviewId))) {
            throw new RuntimeException("REVIEW_NOT_FOUND");
        }
        reviewRepository.deleteById(new ObjectId(reviewId));
        log.info("Review deleted: reviewId={}", reviewId);
    }

    @Override
    public List<ReviewResponse> getReviewsByProductId(String productId) {
        return reviewRepository.findByProductId(productId).stream()
                .map(reviewMapper::toReviewResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ProductRatingResponse getProductRating(String productId) {
        Aggregation aggregation = Aggregation.newAggregation(
                Aggregation.match(org.springframework.data.mongodb.core.query.Criteria.where("productId")
                        .is(productId)),
                Aggregation.group("productId")
                        .avg("rating")
                        .as("averageRating")
                        .count()
                        .as("reviewCount"));

        AggregationResults<ProductRatingResponse> results =
                mongoTemplate.aggregate(aggregation, "reviews", ProductRatingResponse.class);

        List<ProductRatingResponse> mapped = results.getMappedResults();
        if (mapped.isEmpty()) {
            return ProductRatingResponse.builder()
                    .averageRating(0.0)
                    .reviewCount(0)
                    .build();
        }

        ProductRatingResponse response = mapped.get(0);
        if (Double.doubleToLongBits(response.getAverageRating()) == 0) {
            response.setAverageRating(0.0);
        }
        if (response.getReviewCount() == 0L) {
            response.setReviewCount(0L);
        }
        return response;
    }
}
