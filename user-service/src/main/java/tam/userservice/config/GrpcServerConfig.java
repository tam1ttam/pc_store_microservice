package tam.userservice.config;

import io.grpc.Server;
import io.grpc.netty.shaded.io.grpc.netty.NettyServerBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import tam.userservice.grpc.GrpcUserService;

import java.io.IOException;

// @Configuration
public class GrpcServerConfig {

    @Bean(initMethod = "start", destroyMethod = "shutdown")
    public Server grpcServer(
            @Value("${grpc.server.port:6161}") int grpcPort,
            GrpcUserService grpcUserService) throws IOException {
        return NettyServerBuilder.forPort(grpcPort)
                .addService(grpcUserService)
                // Allow TCP reuse to prevent "Address already in use" errors
                .keepAliveTime(30, java.util.concurrent.TimeUnit.SECONDS)
                .keepAliveTimeout(5, java.util.concurrent.TimeUnit.SECONDS)
                .permitKeepAliveWithoutCalls(true)
                .permitKeepAliveTime(5, java.util.concurrent.TimeUnit.MINUTES)
                .build();
    }
}
