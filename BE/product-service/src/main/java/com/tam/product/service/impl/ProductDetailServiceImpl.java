package com.tam.product.service.impl;

import java.util.ArrayList;
import java.util.List;

import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.tam.product.dto.request.ProductDetailCreationRequest;
import com.tam.product.dto.request.UpdateProductDetailReq;
import com.tam.product.dto.response.ProductDetailResponse;
import com.tam.product.entity.Product;
import com.tam.product.entity.ProductDetail;
import com.tam.product.grpc.FileServiceGrpcClient;
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

    @Autowired(required = false)
    FileServiceGrpcClient fileServiceGrpcClient;

    @Override
    public ProductDetailResponse getProductDetailById(String productId) {
        return productDetailRepository
                .findByProductId(new ObjectId(productId))
                .map(productDetailMapper::toProductDetailResponse)
                .orElseThrow(() -> new RuntimeException("PRODUCT_DETAIL_NOT_FOUND"));
    }

    @Override
    public ProductDetailResponse addProductDetail(Product product, ProductDetailCreationRequest request) {
        try {
            ProductDetail productDetail = productDetailMapper.toProductDetail(request);
            productDetail.setProductId(product.getId());
            // Use pre-uploaded URLs if ProductServiceImpl already handled the upload
            List<String> images =
                    (request.getImages() != null && !request.getImages().isEmpty())
                            ? request.getImages()
                            : uploadImages(request.getImagesUpload(), "detail");
            productDetail.setImages(images);

            ProductDetail savedDetail = productDetailRepository.save(productDetail);
            if (savedDetail == null) {
                throw new RuntimeException("PRODUCT_DETAIL_NOT_CREATED");
            }

            log.info("Product detail created for product: {}", product.getId());
            return productDetailMapper.toProductDetailResponse(savedDetail);

        } catch (Exception e) {
            log.error("Error creating product detail for product {}: {}", product.getId(), e.getMessage());
            throw new RuntimeException("PRODUCT_DETAIL_NOT_CREATED");
        }
    }

    @Override
    public ProductDetailResponse updateProductDetail(String productId, UpdateProductDetailReq request) {
        ProductDetail existing = productDetailRepository
                .findByProductId(new ObjectId(productId))
                .orElseGet(() -> {
                    ProductDetail blank = new ProductDetail();
                    blank.setProductId(new ObjectId(productId));
                    blank.setImages(new ArrayList<>());
                    return blank;
                });

        if (request.getProcessor() != null) existing.setProcessor(request.getProcessor());
        if (request.getRam() != null) existing.setRam(request.getRam());
        if (request.getStorage() != null) existing.setStorage(request.getStorage());
        if (request.getGraphicsCard() != null) existing.setGraphicsCard(request.getGraphicsCard());
        if (request.getPowerSupply() != null) existing.setPowerSupply(request.getPowerSupply());
        if (request.getMotherboard() != null) existing.setMotherboard(request.getMotherboard());
        if (request.getCase_() != null) existing.setCase_(request.getCase_());
        if (request.getCoolingSystem() != null) existing.setCoolingSystem(request.getCoolingSystem());
        if (request.getOperatingSystem() != null) existing.setOperatingSystem(request.getOperatingSystem());

        // Use client-provided image list as the base (handles deletions); fall back to DB list
        List<String> baseImages = request.getImages() != null
                ? new ArrayList<>(request.getImages())
                : new ArrayList<>(existing.getImages() != null ? existing.getImages() : List.of());

        List<String> newUrls = uploadImages(request.getImagesUpload(), "detail");
        baseImages.addAll(newUrls);
        existing.setImages(baseImages);

        ProductDetail saved = productDetailRepository.save(existing);
        log.info("Product detail updated for product: {}", productId);
        return productDetailMapper.toProductDetailResponse(saved);
    }

    @Override
    public boolean deleteProductDetailByProductId(String productId) {
        try {
            productDetailRepository.deleteByProductId(new ObjectId(productId));
            log.info("Product detail deleted for product: {}", productId);
            return true;
        } catch (Exception e) {
            log.error("Error deleting product detail for product {}: {}", productId, e.getMessage());
            return false;
        }
    }

    private List<String> uploadImages(List<String> base64List, String folder) {
        List<String> urls = new ArrayList<>();
        if (base64List == null || base64List.isEmpty() || fileServiceGrpcClient == null) {
            return urls;
        }
        for (String base64 : base64List) {
            if (base64 == null || base64.isBlank()) continue;
            try {
                String url = fileServiceGrpcClient.uploadFile(base64, folder);
                urls.add(url);
            } catch (Exception e) {
                log.warn("Failed to upload image via gRPC, skipping: {}", e.getMessage());
            }
        }
        return urls;
    }
}
