package com.tam.profile.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import com.tam.profile.dto.request.CustomerCreationRequest;
import com.tam.profile.dto.request.CustomerUpdateRequest;
import com.tam.profile.dto.response.CustomerResponse;
import com.tam.profile.entity.Customer;

@Mapper(componentModel = "spring")
public interface CustomerMapper {
    Customer toCustomer(CustomerCreationRequest request);

    @Mapping(target = "id", expression = "java(customer.getId().toString())")
    CustomerResponse toCustomerResponse(Customer customer);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "userName", ignore = true)
    @Mapping(source = "request.firstName", target = "firstName")
    @Mapping(source = "request.lastName", target = "lastName")
    @Mapping(source = "request.email", target = "email")
    @Mapping(source = "request.phoneNumber", target = "phoneNumber")
    @Mapping(source = "request.avatar", target = "avatar")
    @Mapping(source = "request.dob", target = "dob")
    @Mapping(source = "request.city", target = "city")
    Customer updateCustomerFromRequest(CustomerUpdateRequest request, @MappingTarget Customer customer);
}
