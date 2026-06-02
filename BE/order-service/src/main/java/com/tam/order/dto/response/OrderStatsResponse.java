package com.tam.order.dto.response;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class OrderStatsResponse {
    long totalOrders;
    double totalRevenue;
    long paidOrders;
    long pendingOrders;
    long completedOrders;
    long cancelledOrders;
}
