package com.devteria.identity.grpc;

import org.springframework.stereotype.Component;

import com.devteria.identity.dto.request.ProfileCreationRequest;
import com.tam.proto.profile.v1.CreateCustomerRequest;
import com.tam.proto.profile.v1.CreateCustomerResponse;
import com.tam.proto.profile.v1.ProfileServiceGrpc;

import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.client.inject.GrpcClient;

@Component
@Slf4j
public class ProfileGrpcClient {

    @GrpcClient("user-service")
    private ProfileServiceGrpc.ProfileServiceBlockingStub profileServiceStub;

    public CreateCustomerResponse createProfile(ProfileCreationRequest request) {
        CreateCustomerRequest grpcRequest = CreateCustomerRequest.newBuilder()
                .setUserName(request.getUsername() != null ? request.getUsername() : "")
                .setFirstName(request.getFirstName() != null ? request.getFirstName() : "")
                .setLastName(request.getLastName() != null ? request.getLastName() : "")
                .setEmail(request.getEmail() != null ? request.getEmail() : "")
                .setPhoneNumber("")
                .setAvatar("")
                .setDob(request.getDob() != null ? request.getDob().toString() : "")
                .setCity(request.getCity() != null ? request.getCity() : "")
                .setUserId(request.getUserId() != null ? request.getUserId() : "")
                .build();

        log.info("Calling gRPC createCustomer for user: {}", request.getUsername());
        return profileServiceStub.createCustomer(grpcRequest);
    }
}
