package com.tam.order.dto.response;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductAnalyticsResponse {
    private String productId;
    private String productName;
    private double totalRevenue;
    private double totalProfit;
    private long totalSold;
}
