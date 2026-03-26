package tam.orchestrator.config;

import io.grpc.Server;
import io.grpc.netty.shaded.io.grpc.netty.NettyServerBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import tam.orchestrator.grpc.GrpcUserService;

@Configuration
public class GrpcServerConfig {

//    @Bean(initMethod = "start", destroyMethod = "shutdown")
//    public Server grpcServer(
//            @Value("${grpc.server.port:9096}") int grpcPort,
//            GrpcUserService grpcUserService
//    ) {
//        return NettyServerBuilder.forPort(grpcPort)
//                .addService(grpcUserService)
//                .build();
//    }
}
