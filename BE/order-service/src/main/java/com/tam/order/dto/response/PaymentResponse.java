package com.tam.order.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;

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
@JsonInclude(JsonInclude.Include.NON_NULL)
public class PaymentResponse {
    String id;
    String paymentId;
    String userId;
    String paymentMethod;
    String orderId;
    Double amount;
    String currency;
    String description;
    String status;
    String url;
}
