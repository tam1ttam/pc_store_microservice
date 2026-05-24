package com.tam.product.service;

import java.util.List;

import com.tam.product.dto.request.CategoryRequest;
import com.tam.product.dto.response.CategoryResponse;

public interface CategoryService {
    List<CategoryResponse> getAllCategories();

    CategoryResponse createCategory(CategoryRequest request);

    void deleteCategory(String id);
}
