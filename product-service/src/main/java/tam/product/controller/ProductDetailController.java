package tam.product.controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tam.common.base.ApiResponse;
import tam.product.dto.res.ProductResponse;
import tam.product.service.ProductService;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/product-detail")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ProductDetailController {

    ProductService productService;

    /**
     * Lấy chi tiết sản phẩm theo Product ID
     * GET /api/v1/product-detail/{productId}
     */
    @GetMapping("/{productId}")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductDetail(@PathVariable String productId) {
        try {
            log.info("Fetching product detail with ID: {}", productId);
            ProductResponse response = productService.getProductById(productId);
            return ResponseEntity.status(HttpStatus.OK).body(
                    ApiResponse.success(HttpStatus.OK, "Product detail found", response)
            );
        } catch (Exception e) {
            log.error("Error fetching product detail with ID: {}", productId, e);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    ApiResponse.success(HttpStatus.NOT_FOUND, "Product detail not found", null)
            );
        }
    }
}
