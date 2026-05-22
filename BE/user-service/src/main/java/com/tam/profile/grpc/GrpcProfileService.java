package com.tam.profile.grpc;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import com.tam.profile.dto.request.CustomerCreationRequest;
import com.tam.profile.dto.request.CustomerUpdateRequest;
import com.tam.profile.dto.response.AddressResponse;
import com.tam.profile.dto.response.CustomerResponse;
import com.tam.profile.service.CustomerService;
import com.tam.proto.profile.v1.*;

import io.grpc.Status;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.service.GrpcService;

@Slf4j
@GrpcService
@RequiredArgsConstructor
public class GrpcProfileService extends ProfileServiceGrpc.ProfileServiceImplBase {

    private final CustomerService customerService;

    @Override
    public void createCustomer(CreateCustomerRequest request, StreamObserver<CreateCustomerResponse> responseObserver) {
        try {
            CustomerCreationRequest creationRequest = CustomerCreationRequest.builder()
                    .userName(request.getUserName())
                    .firstName(request.getFirstName())
                    .lastName(request.getLastName())
                    .email(request.getEmail())
                    .phoneNumber(request.getPhoneNumber())
                    .userId(request.getUserId())
                    .build();

            CustomerResponse customer = customerService.createCustomer(creationRequest);

            responseObserver.onNext(CreateCustomerResponse.newBuilder()
                    .setId(customer.getId())
                    .setUserName(safe(customer.getUserName()))
                    .setFirstName(safe(customer.getFirstName()))
                    .setLastName(safe(customer.getLastName()))
                    .setEmail(safe(customer.getEmail()))
                    .setPhoneNumber(safe(customer.getPhoneNumber()))
                    .setAvatar(safe(customer.getAvatar()))
                    .setDob(safe(customer.getDob()))
                    .setCity(safe(customer.getCity()))
                    .setDefaultPhoneNumber(safe(customer.getDefaultPhoneNumber()))
                    .setDefaultEmail(safe(customer.getDefaultEmail()))
                    .setGender(safe(customer.getGender()))
                    .setIsActive(Boolean.TRUE.equals(customer.getIsActive()))
                    .build());
            responseObserver.onCompleted();
        } catch (Exception e) {
            log.error("createCustomer gRPC error", e);
            responseObserver.onError(
                    Status.INTERNAL.withDescription(e.getMessage()).asRuntimeException());
        }
    }

    @Override
    public void getCustomer(GetCustomerRequest request, StreamObserver<GetCustomerResponse> responseObserver) {
        try {
            CustomerResponse customer = customerService.getCustomerByUserName(request.getUserName());
            responseObserver.onNext(toGetCustomerResponse(customer));
            responseObserver.onCompleted();
        } catch (Exception e) {
            log.error("getCustomer gRPC error", e);
            responseObserver.onError(
                    Status.NOT_FOUND.withDescription(e.getMessage()).asRuntimeException());
        }
    }

    @Override
    public void getCustomerInfo(GetCustomerInfoRequest request, StreamObserver<GetCustomerResponse> responseObserver) {
        try {
            CustomerResponse customer = customerService.getCustomerByUserName(request.getUserName());
            responseObserver.onNext(toGetCustomerResponse(customer));
            responseObserver.onCompleted();
        } catch (Exception e) {
            log.error("getCustomerInfo gRPC error", e);
            responseObserver.onError(
                    Status.NOT_FOUND.withDescription(e.getMessage()).asRuntimeException());
        }
    }

    @Override
    public void getCustomerByUserId(
            GetCustomerByUserIdRequest request, StreamObserver<GetCustomerResponse> responseObserver) {
        try {
            CustomerResponse customer = customerService.getCustomerByUserId(request.getUserId());
            responseObserver.onNext(toGetCustomerResponse(customer));
            responseObserver.onCompleted();
        } catch (Exception e) {
            log.error("getCustomerByUserId gRPC error", e);
            responseObserver.onError(
                    Status.NOT_FOUND.withDescription(e.getMessage()).asRuntimeException());
        }
    }

    @Override
    public void updateCustomer(UpdateCustomerRequest request, StreamObserver<UpdateCustomerResponse> responseObserver) {
        try {
            CustomerUpdateRequest updateRequest = CustomerUpdateRequest.builder()
                    .firstName(request.getFirstName())
                    .lastName(request.getLastName())
                    .email(request.getEmail())
                    .phoneNumber(request.getPhoneNumber())
                    .avatar(request.getAvatar())
                    .dob(request.getDob())
                    .city(request.getCity())
                    .defaultPhoneNumber(request.getDefaultPhoneNumber())
                    .defaultEmail(request.getDefaultEmail())
                    .gender(request.getGender())
                    .build();

            CustomerResponse customer = customerService.updateProfile(request.getUserName(), updateRequest);

            responseObserver.onNext(UpdateCustomerResponse.newBuilder()
                    .setId(customer.getId())
                    .setUpdated(true)
                    .build());
            responseObserver.onCompleted();
        } catch (Exception e) {
            log.error("updateCustomer gRPC error", e);
            responseObserver.onError(
                    Status.INTERNAL.withDescription(e.getMessage()).asRuntimeException());
        }
    }

    @Override
    public void deleteCustomer(DeleteCustomerRequest request, StreamObserver<DeleteCustomerResponse> responseObserver) {
        try {
            customerService.deleteCustomer(request.getUserName());
            responseObserver.onNext(
                    DeleteCustomerResponse.newBuilder().setDeleted(true).build());
            responseObserver.onCompleted();
        } catch (Exception e) {
            log.error("deleteCustomer gRPC error", e);
            responseObserver.onError(
                    Status.INTERNAL.withDescription(e.getMessage()).asRuntimeException());
        }
    }

    @Override
    public void searchCustomers(
            SearchCustomersRequest request, StreamObserver<SearchCustomersResponse> responseObserver) {
        try {
            Page<CustomerResponse> page = customerService.searchCustomersByName(
                    request.getSearchKey(), PageRequest.of(request.getPage(), request.getSize()));

            SearchCustomersResponse.Builder builder = SearchCustomersResponse.newBuilder()
                    .setTotalPages(page.getTotalPages())
                    .setTotalElements((int) page.getTotalElements());

            page.getContent().forEach(c -> builder.addCustomers(toGetCustomerResponse(c)));

            responseObserver.onNext(builder.build());
            responseObserver.onCompleted();
        } catch (Exception e) {
            log.error("searchCustomers gRPC error", e);
            responseObserver.onError(
                    Status.INTERNAL.withDescription(e.getMessage()).asRuntimeException());
        }
    }

    private GetCustomerResponse toGetCustomerResponse(CustomerResponse customer) {
        GetCustomerResponse.Builder builder = GetCustomerResponse.newBuilder()
                .setId(safe(customer.getId()))
                .setUserName(safe(customer.getUserName()))
                .setFirstName(safe(customer.getFirstName()))
                .setLastName(safe(customer.getLastName()))
                .setEmail(safe(customer.getEmail()))
                .setPhoneNumber(safe(customer.getPhoneNumber()))
                .setAvatar(safe(customer.getAvatar()))
                .setDob(safe(customer.getDob()))
                .setCity(safe(customer.getCity()))
                .setDefaultPhoneNumber(safe(customer.getDefaultPhoneNumber()))
                .setDefaultEmail(safe(customer.getDefaultEmail()))
                .setGender(safe(customer.getGender()))
                .setIsActive(Boolean.TRUE.equals(customer.getIsActive()));

        List<AddressResponse> addresses = customer.getAddresses();
        if (addresses != null) {
            builder.addAllAddresses(addresses.stream().map(this::toProtoAddress).collect(Collectors.toList()));
        }

        return builder.build();
    }

    private com.tam.proto.profile.v1.AddressResponse toProtoAddress(AddressResponse addr) {
        com.tam.proto.profile.v1.AddressResponse.Builder b = com.tam.proto.profile.v1.AddressResponse.newBuilder()
                .setId(safe(addr.getId()))
                .setCountry(safe(addr.getCountry()))
                .setProvince(safe(addr.getProvince()))
                .setCity(safe(addr.getCity()))
                .setWard(safe(addr.getWard()))
                .setStreet(safe(addr.getStreet()))
                .setIsDefault(Boolean.TRUE.equals(addr.getIsDefault()))
                .setIsActive(Boolean.TRUE.equals(addr.getIsActive()));

        if (addr.getPhoneContacts() != null) {
            b.addAllPhoneContacts(addr.getPhoneContacts());
        }
        return b.build();
    }

    private String safe(String value) {
        return value != null ? value : "";
    }
}
