package tam.product.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import tam.product.dto.req.ProductRequest;
import tam.product.dto.res.ProductResponse;
import tam.product.repository.ProductRepository;
import tam.product.service.ProductService;

import java.util.List;

@Slf4j
@RequiredArgsConstructor
@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;

    @Override
    public ProductResponse createProduct(ProductRequest request) {
        return null;
    }

    @Override
    public ProductResponse getProductById(String productId) {
        return null;
    }

    @Override
    public Page<ProductResponse> getAllProducts(Pageable pageable) {
        return null;
    }

    @Override
    public Page<ProductResponse> getProductsByCategory(String categoryId, Pageable pageable) {
        return null;
    }

    @Override
    public ProductResponse updateProduct(String productId, ProductRequest request) {
        return null;
    }

    @Override
    public void deleteProduct(String productId) {

    }

    @Override
    public List<ProductResponse> searchByName(String keyword) {
        return List.of();
    }

    @Override
    public List<ProductResponse> getFeaturedProducts() {
        return List.of();
    }

    @Override
    public Page<ProductResponse> getPublishedProducts(Pageable pageable) {
        return null;
    }
}
