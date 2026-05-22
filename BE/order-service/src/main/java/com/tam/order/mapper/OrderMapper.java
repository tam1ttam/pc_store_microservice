package com.tam.order.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.tam.order.dto.request.OrderCreationRequest;
import com.tam.order.dto.response.OrderResponse;
import com.tam.order.entity.Order;

@Mapper(componentModel = "spring")
public interface OrderMapper {

    @Mapping(target = "items", ignore = true)
    @Mapping(target = "orderVouchers", ignore = true)
    Order toOrder(OrderCreationRequest request);

    @Mapping(target = "items", ignore = true)
    OrderResponse toOrderResponse(Order order);
}
