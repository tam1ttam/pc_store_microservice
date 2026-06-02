package com.tam.product.controller;

import java.security.Principal;
import java.util.List;

import jakarta.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.tam.product.dto.request.ReviewCreationRequest;
import com.tam.product.dto.request.ReviewUpdateRequest;
import com.tam.product.dto.response.ProductRatingResponse;
import com.tam.product.dto.response.ReviewResponse;
import com.tam.product.service.ReviewService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
@Slf4j
public class ReviewController {

    private final ReviewService reviewService;

    @PostMapping
    @PreAuthorize("hasAuthority('PRODUCT_REVIEW_CREATE')")
    public ResponseEntity<?> createReview(Principal principal, @Valid @RequestBody ReviewCreationRequest request) {
        String identityUserId = principal.getName();
        ReviewResponse response = reviewService.createReview(identityUserId, request);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{reviewId}")
    @PreAuthorize("hasAuthority('PRODUCT_REVIEW_UPDATE')")
    public ResponseEntity<?> updateReview(
            Principal principal, @PathVariable String reviewId, @Valid @RequestBody ReviewUpdateRequest request) {
        String identityUserId = principal.getName();
        ReviewResponse response = reviewService.updateReview(reviewId, identityUserId, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{reviewId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteReview(@PathVariable String reviewId) {
        reviewService.deleteReview(reviewId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/product/{productId}")
    @PreAuthorize("hasAuthority('PRODUCT_REVIEW_READ')")
    public ResponseEntity<List<ReviewResponse>> getReviewsByProductId(@PathVariable String productId) {
        List<ReviewResponse> reviews = reviewService.getReviewsByProductId(productId);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/product/{productId}/rating")
    public ResponseEntity<ProductRatingResponse> getProductRating(@PathVariable String productId) {
        ProductRatingResponse rating = reviewService.getProductRating(productId);
        return ResponseEntity.ok(rating);
    }
}
