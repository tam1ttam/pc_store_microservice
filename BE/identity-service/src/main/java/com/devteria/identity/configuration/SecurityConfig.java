package com.devteria.identity.configuration;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;

import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomJwtDecoder customJwtDecoder;

    private static final String[] PUBLIC_POST = {
        "/auth/token",
        "/auth/log-in",
        "/auth/introspect",
        "/auth/logout",
        "/auth/refresh",
        "/api/auth/token",
        "/api/auth/log-in",
        "/api/auth/introspect",
        "/api/auth/logout",
        "/api/auth/refresh",
        "/users/registration",
        "/api/users/registration",
        // Client portal
        "/client/auth/token",
        "/client/auth/introspect",
        "/client/auth/logout",
        "/client/auth/refresh",
        // Manager portal
        "/manager/auth/token",
        "/manager/auth/introspect",
        "/manager/auth/logout",
        "/manager/auth/refresh",
        // Admin portal
        "/admin/auth/token",
        "/admin/auth/introspect",
        "/admin/auth/logout",
        "/admin/auth/refresh",
    };

    private static final String[] PUBLIC_GET = {
        "/v3/api-docs/**", "/swagger-ui/**", "/actuator/health",
    };

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.authorizeHttpRequests(req -> req.requestMatchers(HttpMethod.POST, PUBLIC_POST)
                .permitAll()
                .requestMatchers(HttpMethod.GET, PUBLIC_GET)
                .permitAll()
                .anyRequest()
                .authenticated());

        http.oauth2ResourceServer(oauth2 -> oauth2.jwt(
                        jwt -> jwt.decoder(customJwtDecoder).jwtAuthenticationConverter(jwtAuthenticationConverter()))
                .authenticationEntryPoint(new JwtAuthenticationEntryPoint()));

        http.csrf(AbstractHttpConfigurer::disable);

        return http.build();
    }

    @Bean
    JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter converter = new JwtGrantedAuthoritiesConverter();
        converter.setAuthorityPrefix("");
        JwtAuthenticationConverter jwtConverter = new JwtAuthenticationConverter();
        jwtConverter.setJwtGrantedAuthoritiesConverter(converter);
        return jwtConverter;
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }
}
