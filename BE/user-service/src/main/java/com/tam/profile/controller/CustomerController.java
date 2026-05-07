package com.tam.profile.controller;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tam.profile.dto.request.CustomerCreationRequest;
import com.tam.profile.dto.request.CustomerUpdateRequest;
import com.tam.profile.dto.response.ApiResponse;
import com.tam.profile.dto.response.CustomerResponse;
import com.tam.profile.service.CustomerService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class CustomerController {
    CustomerService customerService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<CustomerResponse>> register(@Valid @RequestBody CustomerCreationRequest request) {
        log.info("Registering new customer: {}", request.getUserName());

        CustomerResponse response = customerService.createCustomer(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<CustomerResponse>builder()
                        .code(1000)
                        .message("Đăng ký thành công")
                        .result(response)
                        .build());
    }

    @GetMapping("/{userName}")
    public ResponseEntity<ApiResponse<CustomerResponse>> getCustomer(@PathVariable String userName) {
        log.info("Getting customer by userName: {}", userName);

        CustomerResponse response = customerService.getCustomerByUserName(userName);

        return ResponseEntity.ok(ApiResponse.<CustomerResponse>builder()
                .code(1000)
                .message("Lấy thông tin thành công")
                .result(response)
                .build());
    }

    @GetMapping("/info")
    public ResponseEntity<ApiResponse<CustomerResponse>> getInfo() {
        log.info("Getting current user info");

        CustomerResponse response = customerService.getInfo();

        return ResponseEntity.ok(ApiResponse.<CustomerResponse>builder()
                .code(1000)
                .message("Lấy thông tin thành công")
                .result(response)
                .build());
    }

    @PutMapping("/{userName}")
    public ResponseEntity<ApiResponse<CustomerResponse>> updateCustomer(
            @PathVariable String userName, @RequestBody CustomerUpdateRequest request) {
        log.info("Updating customer: {}", userName);
        CustomerResponse response = customerService.updateCustomer(userName, request);
        return ResponseEntity.ok(ApiResponse.<CustomerResponse>builder()
                .code(1000)
                .message("Cập nhật thành công")
                .result(response)
                .build());
    }
}
