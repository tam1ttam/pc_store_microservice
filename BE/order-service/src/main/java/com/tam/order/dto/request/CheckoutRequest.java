package com.tam.order.dto.request;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CheckoutRequest {
    @NotBlank
    String customerId;

    String customerEmail;
    String customerName;

    @NotBlank
    String shipAddress;

    @NotEmpty
    List<Long> cartItemIds;
}
