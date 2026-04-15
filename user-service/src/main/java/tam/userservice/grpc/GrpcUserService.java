package tam.userservice.grpc;

import io.grpc.Status;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import org.apache.kafka.common.errors.ResourceNotFoundException;
import org.springframework.stereotype.Component;
import tam.common.exception.ConflictException;
//import tam.common.exception.ResourceNotFoundException;
import tam.userservice.entities.User;
import tam.userservice.services.UserProfileService;
import iuh.fit.pc_store.grpc.user.v1.*;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;

@Component
@RequiredArgsConstructor
public class GrpcUserService extends UserServiceGrpc.UserServiceImplBase {
    private final UserProfileService userProfileService;

    @Override
    public void createUserProfile(
            CreateUserProfileRequest request,
            StreamObserver<CreateUserProfileResponse> responseObserver) {
        try {
            LocalDate dateOfBirth = LocalDate.parse(request.getDateOfBirth());
            String userId = userProfileService.createUserProfile(
                    request.getIdentityUserId(),
                    request.getDefaultPhoneNumber(),
                    request.getDefaultEmail(),
                    request.getFirstName(),
                    request.getLastName(),
                    request.getGender(),
                    dateOfBirth,
                    request.getAvatar());

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
            if (identityUserId == null || identityUserId.isBlank()) {
                responseObserver.onError(
                        Status.INVALID_ARGUMENT.withDescription("identityUserId is required").asRuntimeException());
                return;
            }

            User user = (User) userProfileService.getUserProfileByIdentityUserId(identityUserId);
            responseObserver.onNext(GetUserProfileByIdentityResponse.newBuilder()
                    .setId(user.getId())
                    .setIdentityUserId(user.getIdentityUserId())
                    .setDefaultPhoneNumber(user.getDefaultPhoneNumber())
                    .setDefaultEmail(user.getDefaultEmail())
                    .setFirstName(user.getFirstName())
                    .setLastName(user.getLastName())
                    .setGender(user.getGender())
                    .setDateOfBirth(user.getDateOfBirth().toString())
                    .setAvatar(user.getAvatar() == null ? "" : user.getAvatar())
                    .setIsActive(Boolean.TRUE.equals(user.getIsActive()))
                    .build());
            responseObserver.onCompleted();
        } catch (ResourceNotFoundException ex) {
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
            LocalDate dateOfBirth = LocalDate.parse(request.getDateOfBirth());
            boolean updated = userProfileService.updateUserProfile(
                    request.getIdentityUserId(),
                    request.getDefaultPhoneNumber(),
                    request.getDefaultEmail(),
                    request.getFirstName(),
                    request.getLastName(),
                    request.getGender(),
                    dateOfBirth,
                    request.getAvatar());
            responseObserver.onNext(UpdateUserProfileResponse.newBuilder().setId("").setUpdated(updated).build());
            responseObserver.onCompleted();
        } catch (DateTimeParseException ex) {
            responseObserver.onError(
                    Status.INVALID_ARGUMENT.withDescription("Invalid dateOfBirth format").asRuntimeException());
        } catch (Exception ex) {
            responseObserver
                    .onError(Status.INTERNAL.withDescription("Unable to update user profile").asRuntimeException());
        }
    }
}
