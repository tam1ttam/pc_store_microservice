package tam.orchestrator.orchestrator;

import com.tam.proto.profile.v1.CreateCustomerRequest;
import com.tam.proto.profile.v1.CreateCustomerResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import tam.orchestrator.clients.GrpcUserServiceClient;

@Slf4j
@Component
@RequiredArgsConstructor
public class SignupSagaOrchestrator {

    private final GrpcUserServiceClient grpcUserServiceClient;

    public CreateCustomerResponse createCustomer(CreateCustomerRequest request) {
        String userName = request.getUserName();
        log.info("Start signup saga for userName={}", userName);

        try {
            CreateCustomerResponse response = grpcUserServiceClient.createCustomer(request);
            log.info("Signup saga completed for userName={}", userName);
            return response;
        } catch (RuntimeException ex) {
            log.error("Signup saga exception for userName={}: {}", userName, ex.getMessage(), ex);
            compensate(userName);
            throw ex;
        }
    }

    private void compensate(String userName) {
        if (userName != null && !userName.isBlank()) {
            try {
                grpcUserServiceClient.deleteCustomer(userName);
                log.warn("Compensated customer profile for userName={}", userName);
            } catch (Exception compensationEx) {
                log.error("Failed compensating customer profile for userName={}", userName, compensationEx);
            }
        }
    }
}
