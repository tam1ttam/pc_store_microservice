package com.tam.chat.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;

import com.tam.chat.entity.ProductQueryLog;

public interface ProductQueryLogRepository extends MongoRepository<ProductQueryLog, String> {
    @Aggregation(
            pipeline = {
                "{ '$group': { '_id': '$productId', 'count': { '$sum': 1 } } }",
                "{ '$sort': { 'count': -1 } }",
                "{ '$limit': 10 }"
            })
    List<ProductCount> getTopAskedProducts();

    interface ProductCount {
        String getId();

        Long getCount();
    }
}
