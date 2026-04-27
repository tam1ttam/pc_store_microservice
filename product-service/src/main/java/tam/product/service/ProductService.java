package tam.product.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import tam.product.dto.req.ProductRequest;
import tam.product.dto.res.ProductResponse;

import java.util.List;

public interface ProductService {
    /**
     * Tạo sản phẩm mới
     */
    ProductResponse createProduct(ProductRequest request);

    /**
     * Lấy sản phẩm theo ID
     */
    ProductResponse getProductById(String productId);

    /**
     * Lấy tất cả sản phẩm (phân trang)
     */
    Page<ProductResponse> getAllProducts(Pageable pageable);

    /**
     * Lấy sản phẩm theo category
     */
    Page<ProductResponse> getProductsByCategory(String categoryId, Pageable pageable);

    /**
     * Cập nhật sản phẩm
     */
    ProductResponse updateProduct(String productId, ProductRequest request);

    /**
     * Xóa sản phẩm
     */
    void deleteProduct(String productId);

    /**
     * Tìm kiếm sản phẩm theo tên
     */
    List<ProductResponse> searchByName(String keyword);

    /**
     * Lấy sản phẩm nổi bật
     */
    List<ProductResponse> getFeaturedProducts();

    /**
     * Lấy sản phẩm có thể đặt hàng
     */
    Page<ProductResponse> getPublishedProducts(Pageable pageable);
}
