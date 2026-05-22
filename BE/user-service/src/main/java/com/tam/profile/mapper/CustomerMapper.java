package com.tam.profile.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import com.tam.profile.dto.request.AddressRequest;
import com.tam.profile.dto.request.CustomerCreationRequest;
import com.tam.profile.dto.request.CustomerUpdateRequest;
import com.tam.profile.dto.response.AddressResponse;
import com.tam.profile.dto.response.CustomerResponse;
import com.tam.profile.entity.Address;
import com.tam.profile.entity.Customer;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface CustomerMapper {

    Customer toCustomer(CustomerCreationRequest request);

    @Mapping(target = "id", expression = "java(customer.getId().toString())")
    @Mapping(target = "dob", expression = "java(customer.getDob() != null ? customer.getDob().toString() : null)")
    CustomerResponse toCustomerResponse(Customer customer);

    AddressResponse toAddressResponse(Address address);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "isActive", ignore = true)
    Address toAddress(AddressRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "userName", ignore = true)
    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "addresses", ignore = true)
    void updateCustomerFromRequest(CustomerUpdateRequest request, @MappingTarget Customer customer);
}
