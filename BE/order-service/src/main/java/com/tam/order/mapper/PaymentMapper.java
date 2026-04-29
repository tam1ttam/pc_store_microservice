package com.devteria.order.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.devteria.order.dto.request.PaymentRequest;
import com.devteria.order.dto.response.PaymentResponse;
import com.devteria.order.entity.Payment;

@Mapper(componentModel = "spring")
public interface PaymentMapper {
    @Mapping(target = "userId", source = "userId")
    Payment toPayment(PaymentRequest request);

    @Mapping(target = "id", expression = "java(payment.getId().toString())")
    PaymentResponse toPaymentResponse(Payment payment);
}
