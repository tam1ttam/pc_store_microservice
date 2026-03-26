package tam.orchestrator.grpc;

import io.grpc.Status;
import io.grpc.stub.StreamObserver;
//import iuh.fit.common_service.exceptions.ConflictException;
//import iuh.fit.common_service.exceptions.InvalidParamException;
//import iuh.fit.pc_store.grpc.user.v1.CreateUserProfileRequest;
//import iuh.fit.pc_store.grpc.user.v1.CreateUserProfileResponse;
//import iuh.fit.pc_store.grpc.user.v1.DeleteUserProfileRequest;
//import iuh.fit.pc_store.grpc.user.v1.DeleteUserProfileResponse;
//import iuh.fit.pc_store.grpc.user.v1.GetUserProfileByIdentityRequest;
//import iuh.fit.pc_store.grpc.user.v1.GetUserProfileByIdentityResponse;
//import iuh.fit.pc_store.grpc.user.v1.UpdateUserProfileRequest;
//import iuh.fit.pc_store.grpc.user.v1.UpdateUserProfileResponse;
//import iuh.fit.pc_store.grpc.user.v1.UserServiceGrpc;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import tam.orchestrator.clients.GrpcUserServiceClient;
import tam.orchestrator.orchestrator.SignupSagaOrchestrator;

@Component
@Slf4j
@RequiredArgsConstructor
// extends UserServiceGrpc.UserServiceImplBase
public class GrpcUserService  {
    private final SignupSagaOrchestrator signupSagaOrchestrator;
    private final GrpcUserServiceClient grpcUserServiceClient;

//    @Override
//    public void createUserProfile(CreateUserProfileRequest request,
//                                  StreamObserver<CreateUserProfileResponse> responseObserver) {
//        try {
//            CreateUserProfileResponse response = signupSagaOrchestrator.createUserProfile(request);
//            responseObserver.onNext(response);
//            responseObserver.onCompleted();
//        } catch (ConflictException ex) {
//            responseObserver.onError(Status.ALREADY_EXISTS.withDescription(ex.getMessage()).asRuntimeException());
//        } catch (InvalidParamException ex) {
//            responseObserver.onError(Status.INVALID_ARGUMENT.withDescription(ex.getMessage()).asRuntimeException());
//        } catch (Exception ex) {
//            log.error("Signup saga failed for identityUserId={}: {}", request.getIdentityUserId(), ex.getMessage(), ex);
//            responseObserver.onError(Status.INTERNAL.withDescription(messageOrDefault(ex)).asRuntimeException());
//        }
//    }
//
//    @Override
//    public void deleteUserProfile(DeleteUserProfileRequest request,
//                                  StreamObserver<DeleteUserProfileResponse> responseObserver) {
//        try {
//            DeleteUserProfileResponse response = grpcUserServiceClient.deleteUserProfile(request.getIdentityUserId());
//            responseObserver.onNext(response);
//            responseObserver.onCompleted();
//        } catch (InvalidParamException ex) {
//            responseObserver.onError(Status.INVALID_ARGUMENT.withDescription(ex.getMessage()).asRuntimeException());
//        } catch (Exception ex) {
//            log.error("Delete user profile failed for identityUserId={}: {}", request.getIdentityUserId(), ex.getMessage(), ex);
//            responseObserver.onError(Status.INTERNAL.withDescription(messageOrDefault(ex)).asRuntimeException());
//        }
//    }
//
//    @Override
//    public void getUserProfileByIdentity(GetUserProfileByIdentityRequest request,
//                                         StreamObserver<GetUserProfileByIdentityResponse> responseObserver) {
//        try {
//            GetUserProfileByIdentityResponse response = grpcUserServiceClient.getUserProfileByIdentity(request.getIdentityUserId());
//            responseObserver.onNext(response);
//            responseObserver.onCompleted();
//        } catch (InvalidParamException ex) {
//            responseObserver.onError(Status.INVALID_ARGUMENT.withDescription(ex.getMessage()).asRuntimeException());
//        } catch (Exception ex) {
//            log.error("Get user profile failed for identityUserId={}: {}", request.getIdentityUserId(), ex.getMessage(), ex);
//            responseObserver.onError(Status.INTERNAL.withDescription(messageOrDefault(ex)).asRuntimeException());
//        }
//    }
//
//    @Override
//    public void updateUserProfile(UpdateUserProfileRequest request,
//                                  StreamObserver<UpdateUserProfileResponse> responseObserver) {
//        try {
//            UpdateUserProfileResponse response = grpcUserServiceClient.updateUserProfile(request);
//            responseObserver.onNext(response);
//            responseObserver.onCompleted();
//        } catch (InvalidParamException ex) {
//            responseObserver.onError(Status.INVALID_ARGUMENT.withDescription(ex.getMessage()).asRuntimeException());
//        } catch (Exception ex) {
//            log.error("Update user profile failed for identityUserId={}: {}", request.getIdentityUserId(), ex.getMessage(), ex);
//            responseObserver.onError(Status.INTERNAL.withDescription(messageOrDefault(ex)).asRuntimeException());
//        }
//    }
//
//    private static String messageOrDefault(Exception ex) {
//        String message = ex.getMessage();
//        return message == null || message.isBlank() ? "Unable to process request" : message;
//    }
}
