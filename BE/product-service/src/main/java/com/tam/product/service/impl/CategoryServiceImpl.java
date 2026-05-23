package com.tam.product.service.impl;

import java.util.List;

import org.bson.types.ObjectId;
import org.springframework.stereotype.Service;

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
                        .name(c.getName())
                        .build())
                .toList();
    }

    @Override
    public CategoryResponse createCategory(String name) {
        if (categoryRepository.existsByNameIgnoreCase(name)) {
            throw new RuntimeException("Category already exists: " + name);
        }
        Category saved = categoryRepository.save(Category.builder().name(name).build());
        return CategoryResponse.builder()
                .id(saved.getId().toString())
                .name(saved.getName())
                .build();
    }

    @Override
    public void deleteCategory(String id) {
        categoryRepository.deleteById(new ObjectId(id));
    }
}
