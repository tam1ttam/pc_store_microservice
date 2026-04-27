package tam.product.controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tam.common.base.ApiResponse;
import tam.product.dto.req.ProductRequest;
import tam.product.dto.res.ProductResponse;
import tam.product.service.ProductService;

import java.util.List;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/products")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProductController {

    ProductService productService;

    /**
     * Tạo sản phẩm mới
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(@RequestBody ProductRequest request) {
        try {
            log.info("Creating new product: {}", request.getName());
            ProductResponse response = productService.createProduct(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(
                    ApiResponse.success(HttpStatus.CREATED, "Product created successfully", response)
            );
        } catch (Exception e) {
            log.error("Error creating product", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    ApiResponse.success(HttpStatus.BAD_REQUEST, e.getMessage(), null)
            );
        }
    }

    /**
     * Lấy sản phẩm theo ID
     */
    @GetMapping("/{productId}")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductById(@PathVariable String productId) {
        try {
            log.info("Fetching product with ID: {}", productId);
            ProductResponse response = productService.getProductById(productId);
            return ResponseEntity.status(HttpStatus.OK).body(
                    ApiResponse.success(HttpStatus.OK, "Product found", response)
            );
        } catch (Exception e) {
            log.error("Error fetching product with ID: {}", productId, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    ApiResponse.success(HttpStatus.NOT_FOUND, "Product not found", null)
            );
        }
    }

    /**
     * Lấy tất cả sản phẩm (phân trang)
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<ProductResponse>>> getAllProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDirection) {
        try {
            log.info("Fetching all products - page: {}, size: {}", page, size);
            Pageable pageable = org.springframework.data.domain.PageRequest.of(
                    page, size,
                    org.springframework.data.domain.Sort.Direction.fromString(sortDirection), sortBy
            );
            Page<ProductResponse> responses = productService.getAllProducts(pageable);
            return ResponseEntity.status(HttpStatus.OK).body(
                    ApiResponse.success(HttpStatus.OK, "Products fetched successfully", responses)
            );
        } catch (Exception e) {
            log.error("Error fetching all products", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    ApiResponse.success(HttpStatus.BAD_REQUEST, e.getMessage(), null)
            );
        }
    }

    /**
     * Lấy sản phẩm theo category
     */
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<ApiResponse<Page<ProductResponse>>> getProductsByCategory(
            @PathVariable String categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            log.info("Fetching products for category: {}", categoryId);
            Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
            Page<ProductResponse> responses = productService.getProductsByCategory(categoryId, pageable);
            return ResponseEntity.status(HttpStatus.OK).body(
                    ApiResponse.success(HttpStatus.OK, "Category products fetched", responses)
            );
        } catch (Exception e) {
            log.error("Error fetching products for category: {}", categoryId, e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    ApiResponse.success(HttpStatus.BAD_REQUEST, e.getMessage(), null)
            );
        }
    }

    /**
     * Cập nhật sản phẩm
     */
    @PutMapping("/{productId}")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(
            @PathVariable String productId,
            @RequestBody ProductRequest request) {
        try {
            log.info("Updating product with ID: {}", productId);
            ProductResponse response = productService.updateProduct(productId, request);
            return ResponseEntity.status(HttpStatus.OK).body(
                    ApiResponse.success(HttpStatus.OK, "Product updated successfully", response)
            );
        } catch (Exception e) {
            log.error("Error updating product with ID: {}", productId, e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    ApiResponse.success(HttpStatus.BAD_REQUEST, e.getMessage(), null)
            );
        }
    }

    /**
     * Xóa sản phẩm
     */
    @DeleteMapping("/{productId}")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable String productId) {
        try {
            log.info("Deleting product with ID: {}", productId);
            productService.deleteProduct(productId);
            return ResponseEntity.status(HttpStatus.OK).body(
                    ApiResponse.success(HttpStatus.OK, "Product deleted successfully")
            );
        } catch (Exception e) {
            log.error("Error deleting product with ID: {}", productId, e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    ApiResponse.success(HttpStatus.BAD_REQUEST, e.getMessage())
            );
        }
    }

    /**
     * Tìm kiếm sản phẩm theo tên
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> searchByName(
            @RequestParam String keyword) {
        try {
            log.info("Searching products with keyword: {}", keyword);
            List<ProductResponse> responses = productService.searchByName(keyword);
            return ResponseEntity.status(HttpStatus.OK).body(
                    ApiResponse.success(HttpStatus.OK, "Search completed", responses)
            );
        } catch (Exception e) {
            log.error("Error searching products with keyword: {}", keyword, e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    ApiResponse.success(HttpStatus.BAD_REQUEST, e.getMessage(), null)
            );
        }
    }

    /**
     * Lấy sản phẩm nổi bật
     */
    @GetMapping("/featured")
    public ResponseEntity<ApiResponse<List<ProductResponse>>> getFeaturedProducts() {
        try {
            log.info("Fetching featured products");
            List<ProductResponse> responses = productService.getFeaturedProducts();
            return ResponseEntity.status(HttpStatus.OK).body(
                    ApiResponse.success(HttpStatus.OK, "Featured products fetched", responses)
            );
        } catch (Exception e) {
            log.error("Error fetching featured products", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    ApiResponse.success(HttpStatus.BAD_REQUEST, e.getMessage(), null)
            );
        }
    }

    /**
     * Lấy sản phẩm đã publish
     */
    @GetMapping("/published")
    public ResponseEntity<ApiResponse<Page<ProductResponse>>> getPublishedProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            log.info("Fetching published products - page: {}, size: {}", page, size);
            Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
            Page<ProductResponse> responses = productService.getPublishedProducts(pageable);
            return ResponseEntity.status(HttpStatus.OK).body(
                    ApiResponse.success(HttpStatus.OK, "Published products fetched", responses)
            );
        } catch (Exception e) {
            log.error("Error fetching published products", e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(
                    ApiResponse.success(HttpStatus.BAD_REQUEST, e.getMessage(), null)
            );
        }
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public String health() {
        return "Product Service is running";
    }
}
