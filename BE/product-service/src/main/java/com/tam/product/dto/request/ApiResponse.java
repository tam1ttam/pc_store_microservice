package com.tam.product.dto.request;

import lombok.*;
import lombok.experimental.FieldDefaults;

/**
 * Common API Response wrapper cho tất cả controllers
 * TODO: Import từ common-lib sau khi setup
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ApiResponse<T> {
    @Builder.Default
    int code = 1000;

    String message;
    T result;
}
