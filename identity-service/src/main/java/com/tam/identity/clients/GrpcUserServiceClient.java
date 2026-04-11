package com.tam.identity.clients;

import com.tam.identity.dtos.request.auth.RegisterRequest;
import com.tam.identity.dtos.response.auth.RegisterResponse;
import io.grpc.Status;
import io.grpc.StatusRuntimeException;
import iuh.fit.pc_store.grpc.user.v1.CreateUserProfileRequest;
import iuh.fit.pc_store.grpc.user.v1.CreateUserProfileResponse;
import iuh.fit.pc_store.grpc.user.v1.UserServiceGrpc;
import net.devh.boot.grpc.client.inject.GrpcClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import tam.common.exceptions.ConflictException;
import tam.common.exceptions.InvalidParamException;

import java.util.concurrent.TimeUnit;

@Component
public class GrpcUserServiceClient {
    @GrpcClient("user-service")
    private UserServiceGrpc.UserServiceBlockingStub userStub;

    private final long deadlineMs;

    public GrpcUserServiceClient(@Value("${grpc.user-service.deadline-ms:5000}") long deadlineMs) {
        this.deadlineMs = deadlineMs;
    }

    public RegisterResponse register(RegisterRequest request, String identityUserId) {
        CreateUserProfileRequest grpcRequest = CreateUserProfileRequest.newBuilder()
                .setIdentityUserId(identityUserId)
                .setDefaultPhoneNumber(request.getPhoneNumber())
                .setDefaultEmail(request.getEmail() != null ? request.getEmail() : "")
                .setFirstName(request.getFirstName())
                .setLastName(request.getLastName())
                .setGender(request.getGender())
                .setDateOfBirth(request.getDateOfBirth().toString())
                .setAvatar(request.getAvatar() == null ? "" : request.getAvatar())
                .build();
        try {
            CreateUserProfileResponse response = userStub
                    .withDeadlineAfter(deadlineMs, TimeUnit.MILLISECONDS)
                    .createUserProfile(grpcRequest);

            String persistedIdentityUserId = response.getIdentityUserId();
            if (persistedIdentityUserId == null || persistedIdentityUserId.isBlank()) {
                throw new RuntimeException("User service returned an empty identityUserId");
            }

            return RegisterResponse.builder()
                    .userId(persistedIdentityUserId)
                    .phoneNumber(request.getPhoneNumber())
                    .firstName(request.getFirstName())
                    .lastName(request.getLastName())
                    .gender(request.getGender())
                    .dateOfBirth(request.getDateOfBirth())
                    .message("Registration successful")
                    .build();
        } catch (StatusRuntimeException ex) {
            throw mapException(ex);
        }
    }

    private RuntimeException mapException(StatusRuntimeException ex) {
        Status.Code code = ex.getStatus().getCode();
        String description = ex.getStatus().getDescription();
        String message = description == null || description.isBlank()
                ? "Saga orchestrator service error"
                : description;

        if (code == Status.Code.ALREADY_EXISTS) {
            return new ConflictException(message);
        }

        if (code == Status.Code.INVALID_ARGUMENT) {
            return new InvalidParamException(message);
        }

        return new RuntimeException(message, ex);
    }
}
