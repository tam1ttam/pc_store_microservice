package com.tam.identity.mapper;

import com.tam.identity.dtos.request.auth.UserProfileGrpcRequest;
import com.tam.identity.dtos.response.auth.UserProfileGrpcResponse;
import iuh.fit.pc_store.grpc.user.v1.*;
import org.springframework.stereotype.Component;

@Component
public class UserProfileGrpcMapper {

    // ── Request: DTO → gRPC ──────────────────────────────────

    public CreateUserProfileRequest toCreateRequest(UserProfileGrpcRequest dto) {
        return CreateUserProfileRequest.newBuilder()
                .setIdentityUserId(nullSafe(dto.getIdentityUserId()))
                .setDefaultPhoneNumber(nullSafe(dto.getDefaultPhoneNumber()))
                .setDefaultEmail(nullSafe(dto.getDefaultEmail()))
                .setFirstName(nullSafe(dto.getFirstName()))
                .setLastName(nullSafe(dto.getLastName()))
                .setGender(nullSafe(dto.getGender()))
                .setDateOfBirth(nullSafe(dto.getDateOfBirth()))
                .setAvatar(nullSafe(dto.getAvatar()))
                .build();
    }

    public UpdateUserProfileRequest toUpdateRequest(UserProfileGrpcRequest dto) {
        return UpdateUserProfileRequest.newBuilder()
                .setIdentityUserId(nullSafe(dto.getIdentityUserId()))
                .setDefaultPhoneNumber(nullSafe(dto.getDefaultPhoneNumber()))
                .setDefaultEmail(nullSafe(dto.getDefaultEmail()))
                .setFirstName(nullSafe(dto.getFirstName()))
                .setLastName(nullSafe(dto.getLastName()))
                .setGender(nullSafe(dto.getGender()))
                .setDateOfBirth(nullSafe(dto.getDateOfBirth()))
                .setAvatar(nullSafe(dto.getAvatar()))
                .build();
    }

    public GetUserProfileByIdentityRequest toGetByIdentityRequest(String identityUserId) {
        return GetUserProfileByIdentityRequest.newBuilder()
                .setIdentityUserId(identityUserId)
                .build();
    }

    public DeleteUserProfileRequest toDeleteRequest(String identityUserId) {
        return DeleteUserProfileRequest.newBuilder()
                .setIdentityUserId(identityUserId)
                .build();
    }

    // ── Response: gRPC → DTO ─────────────────────────────────

    public UserProfileGrpcResponse toResponse(GetUserProfileByIdentityResponse grpc) {
        return UserProfileGrpcResponse.builder()
                .id(grpc.getId())
                .identityUserId(grpc.getIdentityUserId())
                .defaultPhoneNumber(grpc.getDefaultPhoneNumber())
                .defaultEmail(grpc.getDefaultEmail())
                .firstName(grpc.getFirstName())
                .lastName(grpc.getLastName())
                .gender(grpc.getGender())
                .dateOfBirth(grpc.getDateOfBirth())
                .avatar(grpc.getAvatar())
                .isActive(grpc.getIsActive())
                .addresses(grpc.getAddressesList().stream()
                        .map(this::toAddressResponse)
                        .toList())
                .build();
    }

    private UserProfileGrpcResponse.AddressGrpcResponse toAddressResponse(Address grpc) {
        return UserProfileGrpcResponse.AddressGrpcResponse.builder()
                .id(grpc.getId())
                .country(grpc.getCountry())
                .province(grpc.getProvince())
                .city(grpc.getCity())
                .ward(grpc.getWard())
                .street(grpc.getStreet())
                .isDefault(grpc.getIsDefault())
                .phoneContacts(grpc.getPhoneContactsList())
                .isActive(grpc.getIsActive())
                .build();
    }

    // ── Helper ───────────────────────────────────────────────

    private String nullSafe(String value) {
        return value == null ? "" : value;
    }
}
