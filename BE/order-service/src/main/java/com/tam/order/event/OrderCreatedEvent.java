package com.tam.order.event;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderCreatedEvent {
    String orderId;
    String customerId;
    String customerEmail;
    String customerName;
    List<OrderItemEvent> items;
    double totalPrice;
    String orderDate;
    String shipAddress;
}
