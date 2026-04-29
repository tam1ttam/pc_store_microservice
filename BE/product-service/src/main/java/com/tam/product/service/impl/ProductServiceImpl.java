package com.tam.product.service.impl;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.aggregation.Aggregation;
import org.springframework.data.mongodb.core.aggregation.AggregationResults;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.tam.product.dto.request.ProductCreationRequest;
import com.tam.product.dto.response.ProductResponse;
import com.tam.product.entity.Product;
import com.tam.product.mapper.ProductMapper;
import com.tam.product.repository.ProductRepository;
import com.tam.product.service.ProductDetailService;
import com.tam.product.service.ProductService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductServiceImpl implements ProductService {
    @Autowired
    ProductRepository productRepository;

    @Autowired
    ProductMapper productMapper;

    @Autowired
    ProductDetailService productDetailService;

    final MongoTemplate mongoTemplate;

    // TODO: Inject GeminiService từ File Service để kiểm tra ảnh độc hại
    // @Autowired
    // private GeminiService geminiService;

    /**
     * Lấy sản phẩm mới nhất (Dựa trên ObjectId vì nó chứa timestamp)
     */
    @Override
    public List<Product> getNewestProducts(int limit) {
        Query query = new Query();
        query.with(Sort.by(Sort.Direction.DESC, "_id"));
        query.limit(limit);
        return mongoTemplate.find(query, Product.class);
    }

    /**
     * Lấy sản phẩm bán chạy nhất (Phân tích từ collection 'orders')
     * TODO: Cần gọi Order Service để lấy dữ liệu bán hàng
     */
    @Override
    public List<Product> getBestSellingProducts(int limit) {
        Aggregation aggregation = Aggregation.newAggregation(
                Aggregation.unwind("items"),
                Aggregation.group("items.product._id").sum("items.quantity").as("totalSold"),
                Aggregation.sort(Sort.Direction.DESC, "totalSold"),
                Aggregation.limit(limit),
                Aggregation.lookup("products", "_id", "_id", "productInfo"),
                Aggregation.unwind("productInfo"),
                Aggregation.replaceRoot("productInfo"));

        AggregationResults<Product> results = mongoTemplate.aggregate(aggregation, "orders", Product.class);

        return results.getMappedResults();
    }

    /**
     * Thêm sản phẩm mới
     * TODO: Gọi File Service để validate ảnh qua Gemini
     * TODO: Gọi File Service để upload ảnh lên Cloudinary
     */
    @Override
    @Transactional
    public Optional<ProductResponse> addProduct(ProductCreationRequest request) {
        Product product = Optional.ofNullable(productMapper.toProductV1(request))
                .orElseThrow(() -> new RuntimeException("Error mapping ProductCreationRequest to Product"));

        product.setUpdateDetail(false);

        if (request.getImg() != null && !request.getImg().isEmpty()) {
            // TODO: boolean isSafe = geminiService.isImageSafe(request.getImg());
            // TODO: if (!isSafe) {
            // TODO: throw new AppException(ErrorCode.SENSITIVE_IMAGE_CONTENT);
            // TODO: }
        }

        Product savedProduct = productRepository.save(product);
        if (savedProduct == null) throw new RuntimeException("PRODUCT_NOT_CREATED_SUCCESSFULLY");
        log.info("Product created successfully with id: {}", savedProduct.getId());

        if (request.getProductDetailCreationRequest() != null) {
            try {
                var detailResponse =
                        productDetailService.addProductDetail(savedProduct, request.getProductDetailCreationRequest());

                if (detailResponse != null) {
                    savedProduct.setUpdateDetail(true);
                    savedProduct = productRepository.save(savedProduct);
                    log.info("Product detail linked successfully to product: {}", savedProduct.getId());
                }

            } catch (Exception e) {
                log.error("Failed to create product detail: {}", e.getMessage());
                throw e;
            }
        }

        return Optional.of(productMapper.toProductResponse(savedProduct));
    }

    @Override
    public List<ProductResponse> getProductByNameOrSupplier(String keyword) {
        List<ProductResponse> listProduct = Optional.ofNullable(productRepository.searchByNameOrSupplierName(keyword))
                .orElse(Collections.emptyList())
                .stream()
                .map(productMapper::toProductResponse)
                .collect(Collectors.toList());
        return listProduct;
    }

    @Override
    public ProductResponse getProductById(String productId) {
        return productRepository
                .findById(new ObjectId(productId))
                .map(productMapper::toProductResponse)
                .orElseThrow(() -> new RuntimeException("PRODUCT_NOT_FOUND"));
    }

    /**
     * Cập nhật sản phẩm
     * TODO: Gọi File Service để validate ảnh qua Gemini
     */
    @Override
    @Transactional
    public Optional<ProductResponse> updateProduct(String productId, ProductCreationRequest request) {
        Product existingProduct = productRepository
                .findById(new ObjectId(productId))
                .orElseThrow(() -> new RuntimeException("PRODUCT_NOT_FOUND"));

        if (request.getImg() != null && !request.getImg().isEmpty()) {
            // TODO: boolean isSafe = geminiService.isImageSafe(request.getImg());
            // TODO: if (!isSafe) throw new AppException(ErrorCode.SENSITIVE_IMAGE_CONTENT);
        }

        Product updatedProduct = productMapper.toProductV1(request);
        updatedProduct.setId(existingProduct.getId());
        updatedProduct.setUpdateDetail(existingProduct.isUpdateDetail());

        Product savedProduct = productRepository.save(updatedProduct);
        if (savedProduct == null) throw new RuntimeException("PRODUCT_NOT_UPDATED_SUCCESSFULLY");

        log.info("Product updated successfully: {}", productId);

        if (request.getProductDetailCreationRequest() != null) {
            try {
                productDetailService.deleteProductDetailByProductId(productId);
                var detailResponse =
                        productDetailService.addProductDetail(savedProduct, request.getProductDetailCreationRequest());

                if (detailResponse != null) {
                    savedProduct.setUpdateDetail(true);
                    savedProduct = productRepository.save(savedProduct);
                    log.info("Product detail updated successfully for product: {}", productId);
                }

            } catch (Exception e) {
                log.error("Failed to update product detail: {}", e.getMessage());
                throw new RuntimeException("PRODUCT_DETAIL_UPDATE_FAILED");
            }
        }

        return Optional.of(productMapper.toProductResponse(savedProduct));
    }

    @Transactional
    @Override
    public boolean deleteProductById(String productId) {
        try {
            ObjectId id = new ObjectId(productId);

            productDetailService.deleteProductDetailByProductId(productId);
            log.info("Product detail deleted for product: {}", productId);

            productRepository.deleteById(id);
            log.info("Product deleted: {}", productId);
            boolean deleted = productRepository.findById(id).isEmpty();

            if (deleted) {
                log.info("Product and detail successfully deleted: {}", productId);
            }

            return deleted;

        } catch (Exception e) {
            log.error("Error deleting product {}: {}", productId, e.getMessage());
            throw new RuntimeException("PRODUCT_DELETE_FAILED");
        }
    }

    @Override
    public Page<Product> getProductsByPage(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return productRepository.findAllBy(pageable);
    }

    @Override
    public Page<Product> getProductsByPageAsc(int page, int size) {
        Pageable pageable =
                PageRequest.of(page, size, Sort.by("priceAfterDiscount").ascending());
        return productRepository.findAllBy(pageable);
    }

    @Override
    public Page<Product> getProductsByPageDesc(int page, int size) {
        Pageable pageable =
                PageRequest.of(page, size, Sort.by("priceAfterDiscount").descending());
        return productRepository.findAllBy(pageable);
    }

    @Override
    public boolean updateInStockProduct(ObjectId productId, int quantity) {
        return false;
    }

    @Override
    public Page<Product> getProductByName(String name, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return productRepository.findByNameContaining(name, pageable);
    }

    @Override
    public Page<Product> getProductByName(String name) {
        return (Page<Product>) productRepository.findAllByName(name);
    }
}
