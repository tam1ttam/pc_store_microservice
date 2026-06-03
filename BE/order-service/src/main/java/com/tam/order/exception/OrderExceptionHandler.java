package com.tam.order.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import tam.common.base.ApiResponse;

@RestControllerAdvice
public class OrderExceptionHandler {

    @ExceptionHandler(OutOfStockException.class)
    public ResponseEntity<ApiResponse<?>> handleOutOfStock(OutOfStockException e) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(ApiResponse.builder().code(409).message(e.getMessage()).build());
    }
}
