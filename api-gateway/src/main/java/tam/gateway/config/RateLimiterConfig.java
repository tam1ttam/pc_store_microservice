package tam.gateway.config;

import org.springframework.cloud.gateway.filter.ratelimit.KeyResolver;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import reactor.core.publisher.Mono;

import java.util.Objects;

@Configuration
public class RateLimiterConfig {
    /**
     * Cách 1: Định danh theo địa chỉ IP của Client (Khuyên dùng chống DDoS, Spam chung)
     * Dùng cho cả API đã đăng nhập và chưa đăng nhập (như /login, /register)
     */
    @Bean
    @Primary // Set làm mặc định
    public KeyResolver ipKeyResolver() {
        return exchange -> Mono.just(
                Objects.requireNonNull(exchange.getRequest().getRemoteAddress()).getAddress().getHostAddress()
        );
    }

    /**
     * Cách 2: Định danh theo User ID (Chống spam API nghiệp vụ)
     * Lấy trực tiếp header X-User-Id mà filter của bạn vừa nhét vào
     */
    @Bean
    public KeyResolver userKeyResolver() {
        return exchange -> Mono.justOrEmpty(exchange.getRequest().getHeaders().getFirst("X-User-Id"))
                .defaultIfEmpty("anonymous_user"); // Nếu chưa có ID thì gộp chung vào 1 rổ
    }
}
