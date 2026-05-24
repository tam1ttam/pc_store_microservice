package com.tam.product.service.impl;

import java.util.List;

import org.bson.types.ObjectId;
import org.springframework.stereotype.Service;

import com.tam.product.dto.request.CategoryRequest;
import com.tam.product.dto.response.CategoryResponse;
import com.tam.product.entity.Category;
import com.tam.product.repository.CategoryRepository;
import com.tam.product.service.CategoryService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CategoryServiceImpl implements CategoryService {
    CategoryRepository categoryRepository;

    @Override
    public List<CategoryResponse> getAllCategories() {
        return categoryRepository.findAll().stream()
                .map(c -> CategoryResponse.builder()
                        .id(c.getId().toString())
                        .keyword(c.getKeyword())
                        .name(c.getName())
                        .build())
                .toList();
    }

    @Override
    public CategoryResponse createCategory(CategoryRequest request) {
        String keyword = request.getKeyword() != null
                ? request.getKeyword().toLowerCase().trim()
                : request.getName().toLowerCase().trim();

        if (categoryRepository.existsByKeyword(keyword)) {
            throw new RuntimeException("Category already exists: " + keyword);
        }

        Category saved = categoryRepository.save(
                Category.builder().keyword(keyword).name(request.getName()).build());

        return CategoryResponse.builder()
                .id(saved.getId().toString())
                .keyword(saved.getKeyword())
                .name(saved.getName())
                .build();
    }

    @Override
    public void deleteCategory(String id) {
        categoryRepository.deleteById(new ObjectId(id));
    }
}
