package tam.orchestrator.clients;

import com.tam.proto.profile.v1.CreateCustomerRequest;
import com.tam.proto.profile.v1.CreateCustomerResponse;
import com.tam.proto.profile.v1.DeleteCustomerRequest;
import com.tam.proto.profile.v1.DeleteCustomerResponse;
import com.tam.proto.profile.v1.GetCustomerRequest;
import com.tam.proto.profile.v1.GetCustomerResponse;
import com.tam.proto.profile.v1.ProfileServiceGrpc;
import com.tam.proto.profile.v1.UpdateCustomerRequest;
import com.tam.proto.profile.v1.UpdateCustomerResponse;
import net.devh.boot.grpc.client.inject.GrpcClient;
import org.springframework.stereotype.Component;

@Component
public class GrpcUserServiceClient {

    @GrpcClient("user-service")
    private ProfileServiceGrpc.ProfileServiceBlockingStub profileServiceBlockingStub;

    public CreateCustomerResponse createCustomer(CreateCustomerRequest request) {
        return profileServiceBlockingStub.createCustomer(request);
    }

    public DeleteCustomerResponse deleteCustomer(String userName) {
        DeleteCustomerRequest request = DeleteCustomerRequest.newBuilder()
                .setUserName(userName)
                .build();
        return profileServiceBlockingStub.deleteCustomer(request);
    }

    public GetCustomerResponse getCustomer(String userName) {
        GetCustomerRequest request = GetCustomerRequest.newBuilder()
                .setUserName(userName)
                .build();
        return profileServiceBlockingStub.getCustomer(request);
    }

    public UpdateCustomerResponse updateCustomer(UpdateCustomerRequest request) {
        return profileServiceBlockingStub.updateCustomer(request);
    }
}
