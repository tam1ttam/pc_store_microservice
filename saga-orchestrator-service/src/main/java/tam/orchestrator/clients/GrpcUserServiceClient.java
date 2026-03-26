package tam.orchestrator.clients;


import net.devh.boot.grpc.client.inject.GrpcClient;
import org.springframework.stereotype.Component;

@Component
public class GrpcUserServiceClient {
//    @GrpcClient("user-service")
//    private UserServiceGrpc.UserServiceBlockingStub userServiceBlockingStub;
//
//    public CreateUserProfileResponse createUserProfile(CreateUserProfileRequest request) {
//        return userServiceBlockingStub.createUserProfile(request);
//    }
//
//    public DeleteUserProfileResponse deleteUserProfile(String identityUserId) {
//        DeleteUserProfileRequest request = DeleteUserProfileRequest.newBuilder()
//                .setIdentityUserId(identityUserId)
//                .build();
//        return userServiceBlockingStub.deleteUserProfile(request);
//    }
//
//    public GetUserProfileByIdentityResponse getUserProfileByIdentity(String identityUserId) {
//        GetUserProfileByIdentityRequest request = GetUserProfileByIdentityRequest.newBuilder()
//                .setIdentityUserId(identityUserId)
//                .build();
//        return userServiceBlockingStub.getUserProfileByIdentity(request);
//    }
//
//    public UpdateUserProfileResponse updateUserProfile(UpdateUserProfileRequest request) {
//        return userServiceBlockingStub.updateUserProfile(request);
//    }
}

