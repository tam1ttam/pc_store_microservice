package com.tam.order.grpc;

import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
public class ProductGrpcClient {
    private final RestTemplate restTemplate;

    public double getImportPrice(String productId) {
        try {
            var response = restTemplate.getForObject(
                    "http://product-service/products/internal/import-price/" + productId, Double.class);
            return response != null ? response : 0.0;
        } catch (Exception e) {
            log.error("Failed to fetch import price for product {}: {}", productId, e.getMessage());
            return 0.0;
        }
    }
}
