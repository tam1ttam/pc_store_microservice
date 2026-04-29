package com.devteria.order.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.devteria.order.dto.request.OrderCreationRequest;
import com.devteria.order.dto.response.OrderResponse;
import com.devteria.order.entity.Order;

@Mapper(componentModel = "spring")
public interface OrderMapper {
    @Mapping(target = "customerId", source = "customerId")
    Order toOrder(OrderCreationRequest request);

    @Mapping(target = "id", expression = "java(order.getId().toString())")
    OrderResponse toOrderResponse(Order order);
}
