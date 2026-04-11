package tam.userservice.config;

import io.grpc.Server;
import io.grpc.netty.shaded.io.grpc.netty.NettyServerBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import tam.userservice.grpc.GrpcUserService;

import java.io.IOException;

@Configuration
public class GrpcServerConfig {

    @Bean(initMethod = "start", destroyMethod = "shutdown")
    public Server grpcServer(
            @Value("${grpc.server.port:9091}") int grpcPort,
            GrpcUserService grpcUserService
    ) throws IOException {
        return NettyServerBuilder.forPort(grpcPort)
                .addService(grpcUserService)
                .build();
    }
}
