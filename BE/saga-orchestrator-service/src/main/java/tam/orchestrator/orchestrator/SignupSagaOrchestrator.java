package tam.orchestrator.orchestrator;

//import iuh.fit.pc_store.grpc.user.v1.CreateUserProfileRequest;
//import iuh.fit.pc_store.grpc.user.v1.CreateUserProfileResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import tam.orchestrator.clients.GrpcUserServiceClient;

@Slf4j
@Component
@RequiredArgsConstructor
public class SignupSagaOrchestrator {
    private final GrpcUserServiceClient grpcUserServiceClient;

//    public CreateUserProfileResponse createUserProfile(CreateUserProfileRequest request) {
//        String identityUserId = request.getIdentityUserId();
//        log.info("Start signup saga for identityUserId={}", identityUserId);
//
//        try {
//            CreateUserProfileResponse response = grpcUserServiceClient.createUserProfile(request);
//            log.info("Signup saga completed for identityUserId={}", identityUserId);
//            return response;
//        } catch (RuntimeException ex) {
//            log.error("Signup saga exception for identityUserId={}: {}", identityUserId, ex.getMessage(), ex);
//            compensate(identityUserId);
//            throw ex;
//        }
//    }
//
//    private void compensate(String identityUserId) {
//        if (identityUserId != null && !identityUserId.isBlank()) {
//            try {
//                grpcUserServiceClient.deleteUserProfile(identityUserId);
//                log.warn("Compensated user profile for identityUserId={}", identityUserId);
//            } catch (Exception compensationEx) {
//                log.error("Failed compensating user profile for identityUserId={}", identityUserId, compensationEx);
//            }
//        }
//    }
}
