package tam.product.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tam.product.dto.req.CategoryRequest;
import tam.product.dto.res.CategoryResponse;
import tam.product.service.CategoryService;

import jakarta.validation.Valid;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/categories")
public class CategoryController {

    @Autowired
    private final CategoryService categoryService;

    /**
     * GET /api/v1/categories - Get all categories with pagination
     */
    @GetMapping
    public ResponseEntity<Page<CategoryResponse>> getAllCategories(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "ASC") Sort.Direction direction) {
        log.info("Fetching all categories - page: {}, size: {}", page, size);
        
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        Page<CategoryResponse> categories = categoryService.getAllCategories(pageable);
        
        return ResponseEntity.ok(categories);
    }

    /**
     * GET /api/v1/categories/{categoryId} - Get category by ID
     */
    @GetMapping("/{categoryId}")
    public ResponseEntity<CategoryResponse> getCategoryById(
            @PathVariable String categoryId) {
        log.info("Fetching category with ID: {}", categoryId);
        
        CategoryResponse category = categoryService.getCategoryById(categoryId);
        return ResponseEntity.ok(category);
    }

    /**
     * POST /api/v1/categories - Create new category
     */
    @PostMapping
    public ResponseEntity<CategoryResponse> createCategory(
            @Valid @RequestBody CategoryRequest request) {
        log.info("Creating new category: {}", request.getName());
        
        CategoryResponse category = categoryService.createCategory(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(category);
    }

    /**
     * PUT /api/v1/categories/{categoryId} - Update category
     */
    @PutMapping("/{categoryId}")
    public ResponseEntity<CategoryResponse> updateCategory(
            @PathVariable String categoryId,
            @Valid @RequestBody CategoryRequest request) {
        log.info("Updating category with ID: {}", categoryId);
        
        CategoryResponse category = categoryService.updateCategory(categoryId, request);
        return ResponseEntity.ok(category);
    }

    /**
     * DELETE /api/v1/categories/{categoryId} - Delete category
     */
    @DeleteMapping("/{categoryId}")
    public ResponseEntity<Void> deleteCategory(
            @PathVariable String categoryId) {
        log.info("Deleting category with ID: {}", categoryId);
        
        categoryService.deleteCategory(categoryId);
        return ResponseEntity.noContent().build();
    }
}
