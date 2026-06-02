package com.tam.product.repository;

import java.util.List;
import java.util.Optional;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.tam.product.entity.Review;

@Repository
public interface ReviewRepository extends MongoRepository<Review, ObjectId> {

    List<Review> findByProductId(String productId);

    Optional<Review> findByIdentityUserIdAndOrderIdAndProductId(
            String identityUserId, String orderId, String productId);

    boolean existsByIdentityUserIdAndOrderIdAndProductId(String identityUserId, String orderId, String productId);
}
