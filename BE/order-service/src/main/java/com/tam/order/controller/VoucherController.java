package com.tam.order.controller;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import com.tam.order.dto.request.ApiResponse;
import com.tam.order.dto.request.ApplyVoucherRequest;
import com.tam.order.dto.request.VoucherRequest;
import com.tam.order.dto.response.VoucherResponse;
import com.tam.order.entity.Order;
import com.tam.order.service.VoucherService;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class VoucherController {

    VoucherService voucherService;

    // ── Manager CRUD (/manager/vouchers) ──────────────────────────────────────

    @PostMapping("/manager/vouchers")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ApiResponse<VoucherResponse> create(@RequestBody @Valid VoucherRequest request) {
        return ApiResponse.<VoucherResponse>builder()
                .result(voucherService.create(request))
                .build();
    }

    @GetMapping("/manager/vouchers")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ApiResponse<List<VoucherResponse>> getAll() {
        return ApiResponse.<List<VoucherResponse>>builder()
                .result(voucherService.getAll())
                .build();
    }

    @GetMapping("/manager/vouchers/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ApiResponse<VoucherResponse> getById(@PathVariable Long id) {
        return ApiResponse.<VoucherResponse>builder()
                .result(voucherService.getById(id))
                .build();
    }

    @PutMapping("/manager/vouchers/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ApiResponse<VoucherResponse> update(@PathVariable Long id, @RequestBody @Valid VoucherRequest request) {
        return ApiResponse.<VoucherResponse>builder()
                .result(voucherService.update(id, request))
                .build();
    }

    @DeleteMapping("/manager/vouchers/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ApiResponse<Boolean> delete(@PathVariable Long id) {
        voucherService.delete(id);
        return ApiResponse.<Boolean>builder().result(true).build();
    }

    // ── Client operations (/vouchers) ─────────────────────────────────────────

    @GetMapping("/vouchers")
    public ApiResponse<List<VoucherResponse>> getAvailable(@AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject();
        return ApiResponse.<List<VoucherResponse>>builder()
                .result(voucherService.getAvailableForUser(userId))
                .build();
    }

    @PostMapping("/vouchers/apply")
    public ApiResponse<Order> applyVoucher(
            @AuthenticationPrincipal Jwt jwt, @RequestBody @Valid ApplyVoucherRequest request) {
        return ApiResponse.<Order>builder()
                .result(voucherService.applyVoucher(request, jwt.getSubject()))
                .build();
    }

    @DeleteMapping("/vouchers/unapply")
    public ApiResponse<Order> unapplyVoucher(
            @AuthenticationPrincipal Jwt jwt, @RequestParam Long orderId, @RequestParam String voucherCode) {
        return ApiResponse.<Order>builder()
                .result(voucherService.unapplyVoucher(orderId, voucherCode, jwt.getSubject()))
                .build();
    }
}
