package com.tam.product.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tam.product.dto.request.ApiResponse;
import com.tam.product.dto.response.ProductDetailResponse;
import com.tam.product.service.ProductDetailService;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/product-detail")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ProductDetailController {
    ProductDetailService productDetailService;

    @GetMapping("/{productId}")
    public ApiResponse<ProductDetailResponse> getProductDetailById(@PathVariable String productId) {
        var productDetail = productDetailService.getProductDetailById(productId);
        return ApiResponse.<ProductDetailResponse>builder()
                .result(productDetail)
                .build();
    }
}
