package com.tam.product.repository;

import java.util.Optional;

import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.tam.product.entity.Category;

@Repository
public interface CategoryRepository extends MongoRepository<Category, ObjectId> {
    Optional<Category> findByKeyword(String keyword);

    boolean existsByKeyword(String keyword);

    // giữ lại để dùng khi cần tìm theo tên hiển thị
    Optional<Category> findByNameIgnoreCase(String name);
}
