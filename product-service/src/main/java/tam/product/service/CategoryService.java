package tam.product.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import tam.product.dto.req.CategoryRequest;
import tam.product.dto.res.CategoryResponse;
import tam.product.entity.Category;

public interface CategoryService {
    
    /**
     * Get all categories with pagination
     */
    Page<CategoryResponse> getAllCategories(Pageable pageable);
    
    /**
     * Get category by ID
     */
    CategoryResponse getCategoryById(String categoryId);
    
    /**
     * Create new category
     */
    CategoryResponse createCategory(CategoryRequest request);
    
    /**
     * Update category
     */
    CategoryResponse updateCategory(String categoryId, CategoryRequest request);
    
    /**
     * Delete category by ID
     */
    void deleteCategory(String categoryId);
}
