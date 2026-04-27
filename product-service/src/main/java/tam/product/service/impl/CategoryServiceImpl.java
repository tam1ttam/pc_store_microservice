package tam.product.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import tam.product.dto.req.CategoryRequest;
import tam.product.dto.res.CategoryResponse;
import tam.product.entity.Category;
import tam.product.repository.CategoryRepository;
import tam.product.repository.CategoryRepositoryPagingAndSorting;
import tam.product.service.CategoryService;

@Slf4j
@RequiredArgsConstructor
@Service
public class CategoryServiceImpl implements CategoryService {

    @Autowired
    private final CategoryRepository categoryRepository;

    @Autowired
    private final CategoryRepositoryPagingAndSorting categoryRepositoryPagingAndSorting;

    @Override
    public Page<CategoryResponse> getAllCategories(Pageable pageable) {
        log.info("Fetching all categories with pagination");
        return categoryRepositoryPagingAndSorting.findAll(pageable)
                .map(this::mapToCategoryResponse);
    }

    @Override
    public CategoryResponse getCategoryById(String categoryId) {
        log.info("Fetching category with ID: {}", categoryId);
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found with ID: " + categoryId));
        return mapToCategoryResponse(category);
    }

    @Override
    public CategoryResponse createCategory(CategoryRequest request) {
        log.info("Creating new category: {}", request.getName());
        
        // Generate slug from name
        String slug = generateSlug(request.getName());
        
        Category category = Category.builder()
                .name(request.getName())
                .categoryName(request.getName())
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .keyword(request.getKeyword())
                .slug(slug)
                .build();
        
        Category savedCategory = categoryRepository.save(category);
        log.info("Category created successfully with ID: {}", savedCategory.getCategoryId());
        return mapToCategoryResponse(savedCategory);
    }

    @Override
    public CategoryResponse updateCategory(String categoryId, CategoryRequest request) {
        log.info("Updating category with ID: {}", categoryId);
        
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new RuntimeException("Category not found with ID: " + categoryId));
        
        // Update fields
        if (request.getName() != null) {
            category.setName(request.getName());
            category.setCategoryName(request.getName());
            category.setSlug(generateSlug(request.getName()));
        }
        if (request.getDescription() != null) {
            category.setDescription(request.getDescription());
        }
        if (request.getImageUrl() != null) {
            category.setImageUrl(request.getImageUrl());
        }
        if (request.getKeyword() != null) {
            category.setKeyword(request.getKeyword());
        }
        
        Category updatedCategory = categoryRepository.save(category);
        log.info("Category updated successfully with ID: {}", updatedCategory.getCategoryId());
        return mapToCategoryResponse(updatedCategory);
    }

    @Override
    public void deleteCategory(String categoryId) {
        log.info("Deleting category with ID: {}", categoryId);
        
        if (!categoryRepository.existsById(categoryId)) {
            throw new RuntimeException("Category not found with ID: " + categoryId);
        }
        
        categoryRepository.deleteById(categoryId);
        log.info("Category deleted successfully with ID: {}", categoryId);
    }

    /**
     * Map Category entity to CategoryResponse DTO
     */
    private CategoryResponse mapToCategoryResponse(Category category) {
        return CategoryResponse.builder()
                .categoryId(category.getCategoryId())
                .categoryName(category.getCategoryName())
                .name(category.getName())
                .slug(category.getSlug())
                .description(category.getDescription())
                .imageUrl(category.getImageUrl())
                .keyword(category.getKeyword())
                .build();
    }

    /**
     * Generate slug from name (simple implementation)
     */
    private String generateSlug(String name) {
        return name.toLowerCase()
                .replaceAll("\\s+", "-")
                .replaceAll("[^a-z0-9-]", "");
    }
}
