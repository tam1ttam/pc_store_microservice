package com.tam.product.kafka.event;

import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
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
