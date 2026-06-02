package com.tam.order.controller;

import jakarta.validation.Valid;

import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import com.tam.order.dto.request.ApiResponse;
import com.tam.order.dto.request.CartItemRequest;
import com.tam.order.dto.response.CartResponse;
import com.tam.order.service.CartService;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("/cart")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class CartController {

    CartService cartService;

    @GetMapping
    public ApiResponse<CartResponse> getCart(@AuthenticationPrincipal Jwt jwt) {
        return ApiResponse.<CartResponse>builder()
                .result(cartService.getCart(jwt.getSubject()))
                .build();
    }

    @PutMapping("/items")
    public ApiResponse<CartResponse> upsertItem(
            @AuthenticationPrincipal Jwt jwt, @RequestBody @Valid CartItemRequest request) {
        return ApiResponse.<CartResponse>builder()
                .result(cartService.upsertItem(jwt.getSubject(), request))
                .build();
    }

    @DeleteMapping("/items/{itemId}")
    public ApiResponse<CartResponse> deleteItem(@AuthenticationPrincipal Jwt jwt, @PathVariable Long itemId) {
        return ApiResponse.<CartResponse>builder()
                .result(cartService.deleteItem(jwt.getSubject(), itemId))
                .build();
    }

    @DeleteMapping("/clear")
    public ApiResponse<Boolean> clearCart(@AuthenticationPrincipal Jwt jwt) {
        cartService.clearCart(jwt.getSubject());
        return ApiResponse.<Boolean>builder().result(true).build();
    }
}
