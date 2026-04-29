package tam.userservice.grpc;

import io.grpc.Status;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import net.devh.boot.grpc.server.service.GrpcService;
import org.springframework.stereotype.Component;
import tam.common.exception.ConflictException;
import tam.userservice.dtos.req.AddressRequest;
import tam.userservice.dtos.req.UserProfileRequest;
import tam.userservice.dtos.res.UserProfileResponse;
import tam.userservice.services.UserProfileService;
import iuh.fit.pc_store.grpc.user.v1.CreateUserProfileRequest;
import iuh.fit.pc_store.grpc.user.v1.CreateUserProfileResponse;
import iuh.fit.pc_store.grpc.user.v1.DeleteUserProfileRequest;
import iuh.fit.pc_store.grpc.user.v1.DeleteUserProfileResponse;
import iuh.fit.pc_store.grpc.user.v1.GetUserProfileByIdentityRequest;
import iuh.fit.pc_store.grpc.user.v1.GetUserProfileByIdentityResponse;
import iuh.fit.pc_store.grpc.user.v1.UpdateUserProfileRequest;
import iuh.fit.pc_store.grpc.user.v1.UpdateUserProfileResponse;
import iuh.fit.pc_store.grpc.user.v1.UserServiceGrpc;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;

@Component
@RequiredArgsConstructor
@GrpcService
public class GrpcUserService extends UserServiceGrpc.UserServiceImplBase {
    private final UserProfileService userProfileService;

    @Override
    public void createUserProfile(
            CreateUserProfileRequest request,
            StreamObserver<CreateUserProfileResponse> responseObserver) {
        try {
            LocalDate dateOfBirth = null;
            if (!request.getDateOfBirth().isEmpty()) {
                dateOfBirth = LocalDate.parse(request.getDateOfBirth());
            }

            UserProfileRequest userRequest = UserProfileRequest.builder()
                    .identityUserId(request.getIdentityUserId())
                    .defaultPhoneNumber(request.getDefaultPhoneNumber())
                    .defaultEmail(request.getDefaultEmail())
                    .firstName(request.getFirstName())
                    .lastName(request.getLastName())
                    .gender(request.getGender())
                    .dateOfBirth(dateOfBirth)
                    .avatar(request.getAvatar())
                    .build();

            String userId = userProfileService.createUserProfile(userRequest);

            responseObserver.onNext(CreateUserProfileResponse.newBuilder()
                    .setId(userId)
                    .setIdentityUserId(request.getIdentityUserId())
                    .build());
            responseObserver.onCompleted();
        } catch (ConflictException ex) {
            responseObserver.onError(Status.ALREADY_EXISTS.withDescription(ex.getMessage()).asRuntimeException());
        } catch (DateTimeParseException ex) {
            responseObserver.onError(
                    Status.INVALID_ARGUMENT.withDescription("Invalid dateOfBirth format").asRuntimeException());
        } catch (Exception ex) {
            responseObserver
                    .onError(Status.INTERNAL.withDescription("Unable to create user profile").asRuntimeException());
        }
    }

    @Override
    public void deleteUserProfile(
            DeleteUserProfileRequest request,
            StreamObserver<DeleteUserProfileResponse> responseObserver) {
        try {
            boolean deleted = userProfileService.deleteUserProfileByIdentityUserId(request.getIdentityUserId());
            responseObserver.onNext(DeleteUserProfileResponse.newBuilder().setDeleted(deleted).build());
            responseObserver.onCompleted();
        } catch (ConflictException ex) {
            responseObserver.onError(Status.NOT_FOUND.withDescription(ex.getMessage()).asRuntimeException());
        } catch (Exception ex) {
            responseObserver
                    .onError(Status.INTERNAL.withDescription("Unable to delete user profile").asRuntimeException());
        }
    }

    @Override
    public void getUserProfileByIdentity(
            GetUserProfileByIdentityRequest request,
            StreamObserver<GetUserProfileByIdentityResponse> responseObserver) {
        try {
            String identityUserId = request.getIdentityUserId();
            if (identityUserId.isBlank()) {
                responseObserver.onError(
                        Status.INVALID_ARGUMENT.withDescription("identityUserId is required").asRuntimeException());
                return;
            }

            UserProfileResponse userProfileResponse = userProfileService.getUserProfileByIdentityUserId(identityUserId)
                    .orElse(null);

            if (userProfileResponse == null) {
                responseObserver.onError(
                        Status.NOT_FOUND.withDescription("User profile not found").asRuntimeException());
                return;
            }

            GetUserProfileByIdentityResponse.Builder responseBuilder = GetUserProfileByIdentityResponse.newBuilder()
                    .setId(userProfileResponse.getId())
                    .setIdentityUserId(userProfileResponse.getIdentityUserId())
                    .setDefaultPhoneNumber(userProfileResponse.getDefaultPhoneNumber())
                    .setDefaultEmail(userProfileResponse.getDefaultEmail())
                    .setFirstName(userProfileResponse.getFirstName())
                    .setLastName(userProfileResponse.getLastName())
                    .setGender(userProfileResponse.getGender())
                    .setDateOfBirth(userProfileResponse.getDateOfBirth() != null
                            ? userProfileResponse.getDateOfBirth().toString()
                            : "")
                    .setAvatar(userProfileResponse.getAvatar() != null ? userProfileResponse.getAvatar() : "")
                    .setIsActive(Boolean.TRUE.equals(userProfileResponse.getIsActive()));

            if (userProfileResponse.getAddresses() != null && !userProfileResponse.getAddresses().isEmpty()) {
                userProfileResponse.getAddresses().forEach(addrResponse -> {
                    iuh.fit.pc_store.grpc.user.v1.AddressResponse protoAddress = iuh.fit.pc_store.grpc.user.v1.AddressResponse
                            .newBuilder()
                            .setId(addrResponse.getId())
                            .setCountry(addrResponse.getCountry())
                            .setProvince(addrResponse.getProvince())
                            .setCity(addrResponse.getCity())
                            .setWard(addrResponse.getWard())
                            .setStreet(addrResponse.getStreet())
                            .setIsDefault(Boolean.TRUE.equals(addrResponse.getIsDefault()))
                            .addAllPhoneContacts(
                                    addrResponse.getPhoneContacts() != null ? addrResponse.getPhoneContacts()
                                            : java.util.List.of())
                            .setIsActive(Boolean.TRUE.equals(addrResponse.getIsActive()))
                            .build();
                    responseBuilder.addAddresses(protoAddress);
                });
            }

            responseObserver.onNext(responseBuilder.build());
            responseObserver.onCompleted();
        } catch (ConflictException ex) {
            responseObserver.onError(Status.NOT_FOUND.withDescription(ex.getMessage()).asRuntimeException());
        } catch (Exception ex) {
            responseObserver
                    .onError(Status.INTERNAL.withDescription("Unable to get user profile").asRuntimeException());
        }
    }

    @Override
    public void updateUserProfile(
            UpdateUserProfileRequest request,
            StreamObserver<UpdateUserProfileResponse> responseObserver) {
        try {
            LocalDate dateOfBirth = null;
            if (!request.getDateOfBirth().isEmpty()) {
                dateOfBirth = LocalDate.parse(request.getDateOfBirth());
            }

            UserProfileRequest userRequest = UserProfileRequest.builder()
                    .defaultPhoneNumber(request.getDefaultPhoneNumber())
                    .defaultEmail(request.getDefaultEmail())
                    .firstName(request.getFirstName())
                    .lastName(request.getLastName())
                    .gender(request.getGender())
                    .dateOfBirth(dateOfBirth)
                    .avatar(request.getAvatar())
                    .build();

            boolean updated = userProfileService.updateUserProfile(userRequest, request.getIdentityUserId());

            responseObserver.onNext(UpdateUserProfileResponse.newBuilder()
                    .setId(request.getIdentityUserId())
                    .setUpdated(updated)
                    .build());
            responseObserver.onCompleted();
        } catch (DateTimeParseException ex) {
            responseObserver.onError(
                    Status.INVALID_ARGUMENT.withDescription("Invalid dateOfBirth format").asRuntimeException());
        } catch (ConflictException ex) {
            responseObserver.onError(Status.NOT_FOUND.withDescription(ex.getMessage()).asRuntimeException());
        } catch (Exception ex) {
            responseObserver
                    .onError(Status.INTERNAL.withDescription("Unable to update user profile").asRuntimeException());
        }
    }
}
