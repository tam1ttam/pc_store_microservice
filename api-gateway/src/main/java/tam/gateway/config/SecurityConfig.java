package tam.gateway.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.reactive.CorsConfigurationSource;
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Value("${app.security.cors.allowed-origins:http://localhost:5173}")
    private String allowedOrigins;

    @Bean
    public SecurityWebFilterChain securityWebFilterChain(ServerHttpSecurity http) {
        return http
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .authorizeExchange(auth -> auth
                        // Cho phép OPTIONS request (CORS Preflight)
                        .pathMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Các endpoint công khai (Health check, Login, Register, Refresh token)
                        .pathMatchers("/actuator/health").permitAll()
                        .pathMatchers("/api-gateway/identity-service/api/v1/auth/login").permitAll()
                        .pathMatchers("/api-gateway/identity-service/api/v1/auth/register").permitAll()
                        .pathMatchers("/api-gateway/identity-service/api/v1/auth/refresh").permitAll()
                        .pathMatchers("/api-gateway/identity-service/api/v1/auth/logout").permitAll()

                        // Cho phép xem sản phẩm/tìm kiếm công khai (do đã gộp Product+Search)
                        .pathMatchers(HttpMethod.GET, "/api-gateway/product-service/api/v1/products/**").permitAll()

                        // Tất cả các request khác phải đăng nhập
                        .anyExchange().authenticated())
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()))
                .build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Xử lý danh sách origins từ env
        List<String> origins = Arrays.stream(allowedOrigins.split(","))
                .map(String::trim)
                .filter(origin -> !origin.isBlank())
                .toList();

        configuration.setAllowedOrigins(origins);
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        // Cho phép frontend đọc các header định danh nếu cần
        configuration.setExposedHeaders(List.of("Set-Cookie", "X-User-Id", "X-User-Role"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
