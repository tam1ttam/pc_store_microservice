package com.tam.profile.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.devteria.profile.dto.request.CustomerCreationRequest;
import com.devteria.profile.dto.request.CustomerUpdateRequest;
import com.devteria.profile.dto.response.CustomerResponse;
import com.devteria.profile.entity.Customer;

@Mapper(componentModel = "spring")
public interface CustomerMapper {
    Customer toCustomer(CustomerCreationRequest request);

    @Mapping(target = "id", expression = "java(customer.getId().toString())")
    CustomerResponse toCustomerResponse(Customer customer);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "userName", ignore = true)
    Customer updateCustomerFromRequest(CustomerUpdateRequest request, Customer customer);
}
