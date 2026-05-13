package com.tam.profile.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import com.tam.profile.dto.request.CustomerCreationRequest;
import com.tam.profile.dto.request.CustomerUpdateRequest;
import com.tam.profile.dto.response.CustomerResponse;

public interface CustomerService {
    CustomerResponse createCustomer(CustomerCreationRequest request);

    CustomerResponse getCustomerByUserName(String userName);

    CustomerResponse getCustomerByUserId(String userId);

    CustomerResponse getInfo();

    CustomerResponse updateProfile(String userName, CustomerUpdateRequest request);

    CustomerResponse updateCustomer(String userName, CustomerUpdateRequest request);

    Page<CustomerResponse> getAllCustomers(Pageable pageable);

    Page<CustomerResponse> searchCustomersByName(String searchKey, Pageable pageable);

    void deleteCustomer(String userName);

    boolean existsCustomerByUserName(String userName);

    long countCustomers();
}
