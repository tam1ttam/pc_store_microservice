package tam.orchestrator.grpc;

import com.tam.proto.profile.v1.CreateCustomerRequest;
import com.tam.proto.profile.v1.CreateCustomerResponse;
import com.tam.proto.profile.v1.DeleteCustomerRequest;
import com.tam.proto.profile.v1.DeleteCustomerResponse;
import com.tam.proto.profile.v1.GetCustomerInfoRequest;
import com.tam.proto.profile.v1.GetCustomerRequest;
import com.tam.proto.profile.v1.GetCustomerResponse;
import com.tam.proto.profile.v1.ProfileServiceGrpc;
import com.tam.proto.profile.v1.SearchCustomersRequest;
import com.tam.proto.profile.v1.SearchCustomersResponse;
import com.tam.proto.profile.v1.UpdateCustomerRequest;
import com.tam.proto.profile.v1.UpdateCustomerResponse;
import io.grpc.Status;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.service.GrpcService;
import tam.orchestrator.clients.GrpcUserServiceClient;
import tam.orchestrator.orchestrator.SignupSagaOrchestrator;

@GrpcService
@Slf4j
@RequiredArgsConstructor
public class GrpcUserService extends ProfileServiceGrpc.ProfileServiceImplBase {

    private final SignupSagaOrchestrator signupSagaOrchestrator;
    private final GrpcUserServiceClient grpcUserServiceClient;

    @Override
    public void createCustomer(CreateCustomerRequest request,
                               StreamObserver<CreateCustomerResponse> responseObserver) {
        try {
            CreateCustomerResponse response = signupSagaOrchestrator.createCustomer(request);
            responseObserver.onNext(response);
            responseObserver.onCompleted();
        } catch (Exception ex) {
            log.error("Signup saga failed for userName={}: {}", request.getUserName(), ex.getMessage(), ex);
            responseObserver.onError(Status.INTERNAL.withDescription(messageOrDefault(ex)).asRuntimeException());
        }
    }

    @Override
    public void deleteCustomer(DeleteCustomerRequest request,
                               StreamObserver<DeleteCustomerResponse> responseObserver) {
        try {
            DeleteCustomerResponse response = grpcUserServiceClient.deleteCustomer(request.getUserName());
            responseObserver.onNext(response);
            responseObserver.onCompleted();
        } catch (Exception ex) {
            log.error("Delete customer failed for userName={}: {}", request.getUserName(), ex.getMessage(), ex);
            responseObserver.onError(Status.INTERNAL.withDescription(messageOrDefault(ex)).asRuntimeException());
        }
    }

    @Override
    public void getCustomer(GetCustomerRequest request,
                            StreamObserver<GetCustomerResponse> responseObserver) {
        try {
            GetCustomerResponse response = grpcUserServiceClient.getCustomer(request.getUserName());
            responseObserver.onNext(response);
            responseObserver.onCompleted();
        } catch (Exception ex) {
            log.error("Get customer failed for userName={}: {}", request.getUserName(), ex.getMessage(), ex);
            responseObserver.onError(Status.INTERNAL.withDescription(messageOrDefault(ex)).asRuntimeException());
        }
    }

    @Override
    public void getCustomerInfo(GetCustomerInfoRequest request,
                                StreamObserver<GetCustomerResponse> responseObserver) {
        try {
            GetCustomerResponse response = grpcUserServiceClient.getCustomer(request.getUserName());
            responseObserver.onNext(response);
            responseObserver.onCompleted();
        } catch (Exception ex) {
            log.error("Get customer info failed for userName={}: {}", request.getUserName(), ex.getMessage(), ex);
            responseObserver.onError(Status.INTERNAL.withDescription(messageOrDefault(ex)).asRuntimeException());
        }
    }

    @Override
    public void updateCustomer(UpdateCustomerRequest request,
                               StreamObserver<UpdateCustomerResponse> responseObserver) {
        try {
            UpdateCustomerResponse response = grpcUserServiceClient.updateCustomer(request);
            responseObserver.onNext(response);
            responseObserver.onCompleted();
        } catch (Exception ex) {
            log.error("Update customer failed for userName={}: {}", request.getUserName(), ex.getMessage(), ex);
            responseObserver.onError(Status.INTERNAL.withDescription(messageOrDefault(ex)).asRuntimeException());
        }
    }

    @Override
    public void searchCustomers(SearchCustomersRequest request,
                                StreamObserver<SearchCustomersResponse> responseObserver) {
        responseObserver.onError(Status.UNIMPLEMENTED.withDescription("searchCustomers not supported via orchestrator").asRuntimeException());
    }

    private static String messageOrDefault(Exception ex) {
        String message = ex.getMessage();
        return message == null || message.isBlank() ? "Unable to process request" : message;
    }
}
