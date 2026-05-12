package com.tam.profile.grpc;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import com.tam.profile.dto.request.CustomerCreationRequest;
import com.tam.profile.dto.request.CustomerUpdateRequest;
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
                    .setUserName(customer.getUserName())
                    .setFirstName(customer.getFirstName())
                    .setLastName(customer.getLastName())
                    .setEmail(customer.getEmail())
                    .setPhoneNumber(customer.getPhoneNumber() != null ? customer.getPhoneNumber() : "")
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
    public void updateCustomer(UpdateCustomerRequest request, StreamObserver<UpdateCustomerResponse> responseObserver) {
        try {
            CustomerUpdateRequest updateRequest = CustomerUpdateRequest.builder()
                    .firstName(request.getFirstName())
                    .lastName(request.getLastName())
                    .email(request.getEmail())
                    .phoneNumber(request.getPhoneNumber())
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

    private GetCustomerResponse toGetCustomerResponse(CustomerResponse customer) {
        return GetCustomerResponse.newBuilder()
                .setId(customer.getId())
                .setUserName(customer.getUserName())
                .setFirstName(customer.getFirstName())
                .setLastName(customer.getLastName())
                .setEmail(customer.getEmail())
                .setPhoneNumber(customer.getPhoneNumber() != null ? customer.getPhoneNumber() : "")
                .build();
    }
}
