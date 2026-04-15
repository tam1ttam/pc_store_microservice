package tam.gateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        return http
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .cors(ServerHttpSecurity.CorsSpec::disable) // CorsWebFilter trong CorsConfig lo rồi
                .authorizeExchange(auth -> auth
                        // Preflight OPTIONS — phải permit trước mọi thứ
                        .pathMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Health check
                        .pathMatchers("/actuator/health").permitAll()

                        // Auth endpoints công khai
                        .pathMatchers("/api-gateway/identity-service/api/v1/auth/**").permitAll()

                        // Xem sản phẩm không cần đăng nhập
                        .pathMatchers(HttpMethod.GET, "/api-gateway/product-service/api/v1/products/**").permitAll()

                        // Tất cả còn lại phải authenticate
                        .anyExchange().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()))
                .build();
    }
}