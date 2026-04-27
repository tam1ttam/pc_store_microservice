package tam.order.config.client;

import io.grpc.channelz.v1.Server;
import io.grpc.netty.shaded.io.grpc.netty.NettyServerBuilder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import tam.order.grpc.GrpcOrderService;

import java.io.IOException;

public class GrpcServerConfig {
//    @Bean(initMethod = "start", destroyMethod = "shutdown")
//    public Server grpcServer(
//            @Value("${grpc.server.port:6165}") int grpcPort,
//            GrpcOrderService grpcUserService) throws IOException {
//        return NettyServerBuilder.forPort(grpcPort)
//                .addService(grpcUserService)
//                // Allow TCP reuse to prevent "Address already in use" errors
//                .keepAliveTime(30, java.util.concurrent.TimeUnit.SECONDS)
//                .keepAliveTimeout(5, java.util.concurrent.TimeUnit.SECONDS)
//                .permitKeepAliveWithoutCalls(true)
//                .permitKeepAliveTime(5, java.util.concurrent.TimeUnit.MINUTES)
//                .build();
//    }
}
