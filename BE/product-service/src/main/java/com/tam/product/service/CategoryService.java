package com.tam.product.service;

import java.util.List;

import com.tam.product.dto.response.CategoryResponse;

public interface CategoryService {
    List<CategoryResponse> getAllCategories();

    CategoryResponse createCategory(String name);

    void deleteCategory(String id);
}
