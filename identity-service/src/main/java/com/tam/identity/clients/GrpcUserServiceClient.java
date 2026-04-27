package com.tam.identity.clients;


import com.tam.identity.dtos.request.auth.UserProfileGrpcRequest;
import com.tam.identity.dtos.response.auth.UserProfileGrpcResponse;
import io.grpc.Status;
import io.grpc.StatusRuntimeException;
import iuh.fit.pc_store.grpc.user.v1.*;
import net.devh.boot.grpc.client.inject.GrpcClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import tam.common.exception.ConflictException;
import tam.common.exception.InvalidParamException;

import java.util.List;
import java.util.concurrent.TimeUnit;

@Component
public class GrpcUserServiceClient {
    @GrpcClient("user-service")
    private UserServiceGrpc.UserServiceBlockingStub userStub;

    private final long deadlineMs;

    public GrpcUserServiceClient(@Value("${grpc.user-service.deadline-ms:5000}") long deadlineMs) {
        this.deadlineMs = deadlineMs;
    }

    public CreateUserProfileResponse createUserProfile(CreateUserProfileRequest request) {
        try {

            CreateUserProfileResponse response = userStub
                    .withDeadlineAfter(deadlineMs, TimeUnit.MILLISECONDS)
                    .createUserProfile(request);

            return response;
        } catch (StatusRuntimeException ex) {
            throw mapException(ex);
        }
    }

    public UserProfileGrpcResponse getUserProfileByIdentity(String identityUserId) {
        try {
            GetUserProfileByIdentityRequest grpcRequest = GetUserProfileByIdentityRequest.newBuilder()
                    .setIdentityUserId(identityUserId)
                    .build();

            GetUserProfileByIdentityResponse response = userStub
                    .withDeadlineAfter(deadlineMs, TimeUnit.MILLISECONDS)
                    .getUserProfileByIdentity(grpcRequest);

            return mapToGrpcResponse(response);
        } catch (StatusRuntimeException ex) {
            throw mapException(ex);
        }
    }

    public boolean deleteUserProfile(String identityUserId) {
        try {
            DeleteUserProfileRequest grpcRequest = DeleteUserProfileRequest.newBuilder()
                    .setIdentityUserId(identityUserId)
                    .build();

            DeleteUserProfileResponse response = userStub
                    .withDeadlineAfter(deadlineMs, TimeUnit.MILLISECONDS)
                    .deleteUserProfile(grpcRequest);

            return response.getDeleted();
        } catch (StatusRuntimeException ex) {
            throw mapException(ex);
        }
    }

    public boolean updateUserProfile(UserProfileGrpcRequest request) {
        try {
            UpdateUserProfileRequest grpcRequest = UpdateUserProfileRequest.newBuilder()
                    .setIdentityUserId(request.getIdentityUserId())
                    .setDefaultPhoneNumber(nullSafe(request.getDefaultPhoneNumber()))
                    .setDefaultEmail(nullSafe(request.getDefaultEmail()))
                    .setFirstName(nullSafe(request.getFirstName()))
                    .setLastName(nullSafe(request.getLastName()))
                    .setGender(nullSafe(request.getGender()))
                    .setDateOfBirth(nullSafe(request.getDateOfBirth()))
                    .setAvatar(nullSafe(request.getAvatar()))
                    .build();

            UpdateUserProfileResponse response = userStub
                    .withDeadlineAfter(deadlineMs, TimeUnit.MILLISECONDS)
                    .updateUserProfile(grpcRequest);

            return response.getUpdated();
        } catch (StatusRuntimeException ex) {
            throw mapException(ex);
        }
    }

    // ── Helpers ──────────────────────────────────────────────

    private UserProfileGrpcResponse mapToGrpcResponse(GetUserProfileByIdentityResponse response) {
        List<UserProfileGrpcResponse.AddressGrpcResponse> addresses = response.getAddressesList().stream()
                .map(addr -> UserProfileGrpcResponse.AddressGrpcResponse.builder()
                        .id(addr.getId())
                        .country(addr.getCountry())
                        .province(addr.getProvince())
                        .city(addr.getCity())
                        .ward(addr.getWard())
                        .street(addr.getStreet())
                        .isDefault(addr.getIsDefault())
                        .phoneContacts(addr.getPhoneContactsList())
                        .isActive(addr.getIsActive())
                        .build())
                .toList();

        return UserProfileGrpcResponse.builder()
                .id(response.getId())
                .identityUserId(response.getIdentityUserId())
                .defaultPhoneNumber(response.getDefaultPhoneNumber())
                .defaultEmail(response.getDefaultEmail())
                .firstName(response.getFirstName())
                .lastName(response.getLastName())
                .gender(response.getGender())
                .dateOfBirth(response.getDateOfBirth())
                .avatar(response.getAvatar())
                .isActive(response.getIsActive())
                .addresses(addresses)
                .build();
    }

    private String nullSafe(String value) {
        return value == null ? "" : value;
    }

    private RuntimeException mapException(StatusRuntimeException ex) {
        Status.Code code = ex.getStatus().getCode();
        String description = ex.getStatus().getDescription();
        String message = description == null || description.isBlank() ? "User service error" : description;

        return switch (code) {
            case ALREADY_EXISTS -> new ConflictException(message);
            case INVALID_ARGUMENT -> new InvalidParamException(message);
            case NOT_FOUND -> new ConflictException(message);
            default -> new RuntimeException(message, ex);
        };
    }
}
