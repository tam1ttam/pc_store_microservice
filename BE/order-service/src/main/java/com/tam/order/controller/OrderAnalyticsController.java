package com.tam.order.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;

import com.tam.order.dto.request.ApiResponse;
import com.tam.order.dto.response.ProductAnalyticsResponse;
import com.tam.order.service.OrderService;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("/analytics")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class OrderAnalyticsController {
    OrderService orderService;

    @GetMapping("/products")
    public ApiResponse<List<ProductAnalyticsResponse>> getProductAnalytics() {
        return ApiResponse.<List<ProductAnalyticsResponse>>builder()
                .result(orderService.getProductAnalytics())
                .build();
    }
}
