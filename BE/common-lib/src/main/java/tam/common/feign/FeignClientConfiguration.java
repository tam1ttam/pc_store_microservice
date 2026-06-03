package tam.common.feign;

import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.context.annotation.Configuration;

/**
 * Feign client configuration for inter-service communication.
 * Enables Feign clients for all microservices in the com.devteria package.
 */
@Configuration
@EnableFeignClients(basePackages = "com.devteria")
public class FeignClientConfiguration {
    // Feign clients will be auto-discovered from com.devteria package
}
