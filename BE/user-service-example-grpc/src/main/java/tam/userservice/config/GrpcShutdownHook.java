package tam.userservice.config;

import io.grpc.Server;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.stereotype.Component;

import javax.annotation.PreDestroy;
import java.util.concurrent.TimeUnit;
import java.util.logging.Logger;

@Component
public class GrpcShutdownHook {
    private static final Logger logger = Logger.getLogger(GrpcShutdownHook.class.getName());
    private final Server grpcServer;

    public GrpcShutdownHook(ObjectProvider<Server> grpcServerProvider) {
        this.grpcServer = grpcServerProvider.getIfAvailable();
    }

    @PreDestroy
    public void onDestroy() throws InterruptedException {
        if (grpcServer == null) {
            logger.info("gRPC Server not available, skipping shutdown hook");
            return;
        }

        logger.info("Starting gRPC Server graceful shutdown...");

        // Graceful shutdown: wait 10 seconds then force shutdown
        grpcServer.shutdown();
        if (!grpcServer.awaitTermination(10, TimeUnit.SECONDS)) {
            logger.warning("gRPC server didn't terminate gracefully, force shutting down");
            grpcServer.shutdownNow();
            grpcServer.awaitTermination(5, TimeUnit.SECONDS);
        }

        logger.info("gRPC Server shutdown complete");
    }
}
