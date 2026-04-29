package com.tam.product.service.impl;

import java.util.ArrayList;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.tam.product.dto.request.ProductDetailCreationRequest;
import com.tam.product.dto.response.ProductDetailResponse;
import com.tam.product.entity.Product;
import com.tam.product.entity.ProductDetail;
import com.tam.product.mapper.ProductDetailMapper;
import com.tam.product.repository.ProductDetailRepository;
import com.tam.product.service.ProductDetailService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProductDetailServiceImpl implements ProductDetailService {
    @Autowired
    ProductDetailMapper productDetailMapper;

    @Autowired
    ProductDetailRepository productDetailRepository;

    @Override
    public ProductDetailResponse getProductDetailById(String productId) {
        return productDetailRepository
                .findByProductId(new ObjectId(productId))
                .map(productDetailMapper::toProductDetailResponse)
                .orElseThrow(() -> new RuntimeException("PRODUCT_DETAIL_NOT_FOUND"));
    }

    /**
     * Thêm chi tiết sản phẩm
     * TODO: Nếu có hình ảnh base64, cần gọi File Service để upload và lấy URL
     */
    @Override
    public ProductDetailResponse addProductDetail(Product product, ProductDetailCreationRequest request) {
        try {
            ProductDetail productDetail = productDetailMapper.toProductDetail(request);
            productDetail.setProduct(product);
            productDetail.setImages(new ArrayList<>());

            ProductDetail savedDetail = productDetailRepository.save(productDetail);

            if (savedDetail == null) {
                throw new RuntimeException("PRODUCT_DETAIL_NOT_CREATED");
            }

            log.info("Product detail created successfully for product: {}", product.getId());

            // TODO: Upload images nếu có
            // TODO: Gọi File Service để upload imagesUpload

            return productDetailMapper.toProductDetailResponse(savedDetail);

        } catch (Exception e) {
            log.error("Error creating product detail for product {}: {}", product.getId(), e.getMessage());
            throw new RuntimeException("PRODUCT_DETAIL_NOT_CREATED");
        }
    }

    @Override
    public boolean deleteProductDetailByProductId(String productId) {
        try {
            ObjectId id = new ObjectId(productId);
            productDetailRepository.deleteByProductId(id);
            log.info("Product detail deleted for product: {}", productId);
            return true;
        } catch (Exception e) {
            log.error("Error deleting product detail for product {}: {}", productId, e.getMessage());
            return false;
        }
    }
}
