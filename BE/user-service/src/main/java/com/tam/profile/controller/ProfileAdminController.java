package com.tam.profile.controller;

import jakarta.validation.Valid;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.tam.profile.dto.request.CustomerUpdateRequest;
import com.tam.profile.dto.response.ApiResponse;
import com.tam.profile.dto.response.CustomerResponse;
import com.tam.profile.service.CustomerService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/admin/customers")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@PreAuthorize("hasRole('ADMIN')")
@Slf4j
public class ProfileAdminController {
    CustomerService customerService;

    @GetMapping
    public ResponseEntity<ApiResponse<Page<CustomerResponse>>> getAllCustomers(Pageable pageable) {
        log.info("Admin: Getting all customers with pagination");

        Page<CustomerResponse> response = customerService.getAllCustomers(pageable);

        return ResponseEntity.ok(ApiResponse.<Page<CustomerResponse>>builder()
                .code(1000)
                .message("Lấy danh sách thành công")
                .result(response)
                .build());
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<Page<CustomerResponse>>> searchCustomers(
            @RequestParam String searchKey, Pageable pageable) {
        log.info("Admin: Searching customers with key: {}", searchKey);

        Page<CustomerResponse> response = customerService.searchCustomersByName(searchKey, pageable);

        return ResponseEntity.ok(ApiResponse.<Page<CustomerResponse>>builder()
                .code(1000)
                .message("Tìm kiếm thành công")
                .result(response)
                .build());
    }

    @PutMapping("/{userName}")
    public ResponseEntity<ApiResponse<CustomerResponse>> updateCustomer(
            @PathVariable String userName, @Valid @RequestBody CustomerUpdateRequest request) {
        log.info("Admin: Updating customer profile: {}", userName);

        CustomerResponse response = customerService.updateProfile(userName, request);

        return ResponseEntity.ok(ApiResponse.<CustomerResponse>builder()
                .code(1000)
                .message("Cập nhật thành công")
                .result(response)
                .build());
    }

    @DeleteMapping("/{userName}")
    public ResponseEntity<ApiResponse<String>> deleteCustomer(@PathVariable String userName) {
        log.info("Admin: Deleting customer: {}", userName);

        customerService.deleteCustomer(userName);

        return ResponseEntity.ok(ApiResponse.<String>builder()
                .code(1000)
                .message("Xóa thành công")
                .result("Người dùng đã bị xóa: " + userName)
                .build());
    }
}
