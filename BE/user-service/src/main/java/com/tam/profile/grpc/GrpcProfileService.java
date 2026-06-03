package com.tam.profile.grpc;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

import com.tam.profile.dto.request.ProfileCreationRequest;
import com.tam.profile.dto.request.ProfileUpdateRequest;
import com.tam.profile.dto.response.AddressResponse;
import com.tam.profile.dto.response.ProfileResponse;
import com.tam.profile.service.ProfileService;
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

    private final ProfileService profileService;

    @Override
    public void createCustomer(CreateCustomerRequest request, StreamObserver<CreateCustomerResponse> responseObserver) {
        try {
            ProfileCreationRequest creationRequest = ProfileCreationRequest.builder()
                    .userName(request.getUserName())
                    .firstName(request.getFirstName())
                    .lastName(request.getLastName())
                    .email(request.getEmail())
                    .phoneNumber(request.getPhoneNumber())
                    .userId(request.getUserId())
                    .build();

            ProfileResponse profile = profileService.createProfile(creationRequest);

            responseObserver.onNext(CreateCustomerResponse.newBuilder()
                    .setId(profile.getId())
                    .setUserName(safe(profile.getUserName()))
                    .setFirstName(safe(profile.getFirstName()))
                    .setLastName(safe(profile.getLastName()))
                    .setEmail(safe(profile.getEmail()))
                    .setPhoneNumber(safe(profile.getPhoneNumber()))
                    .setAvatar(safe(profile.getAvatar()))
                    .setDob(safe(profile.getDob()))
                    .setGender(safe(profile.getGender()))
                    .setIsActive(Boolean.TRUE.equals(profile.getIsActive()))
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
            ProfileResponse profile = profileService.getProfileByUserName(request.getUserName());
            responseObserver.onNext(toGetCustomerResponse(profile));
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
            ProfileResponse profile = profileService.getProfileByUserName(request.getUserName());
            responseObserver.onNext(toGetCustomerResponse(profile));
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
            ProfileResponse profile = profileService.getProfileByUserId(request.getUserId());
            responseObserver.onNext(toGetCustomerResponse(profile));
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
            ProfileUpdateRequest updateRequest = ProfileUpdateRequest.builder()
                    .firstName(request.getFirstName())
                    .lastName(request.getLastName())
                    .email(request.getEmail())
                    .phoneNumber(request.getPhoneNumber())
                    .avatar(request.getAvatar())
                    .dob(request.getDob())
                    .gender(request.getGender())
                    .build();

            ProfileResponse profile = profileService.updateProfile(request.getUserName(), updateRequest);

            responseObserver.onNext(UpdateCustomerResponse.newBuilder()
                    .setId(profile.getId())
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
            profileService.deleteProfile(request.getUserName());
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
            Page<ProfileResponse> page = profileService.searchProfilesByName(
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

    private GetCustomerResponse toGetCustomerResponse(ProfileResponse profile) {
        GetCustomerResponse.Builder builder = GetCustomerResponse.newBuilder()
                .setId(safe(profile.getId()))
                .setUserName(safe(profile.getUserName()))
                .setFirstName(safe(profile.getFirstName()))
                .setLastName(safe(profile.getLastName()))
                .setEmail(safe(profile.getEmail()))
                .setPhoneNumber(safe(profile.getPhoneNumber()))
                .setAvatar(safe(profile.getAvatar()))
                .setDob(safe(profile.getDob()))
                .setGender(safe(profile.getGender()))
                .setIsActive(Boolean.TRUE.equals(profile.getIsActive()));

        List<AddressResponse> addresses = profile.getAddresses();
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
