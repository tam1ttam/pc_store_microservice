package com.tam.identity.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Security configuration for Identity Service
 * 
 * Features:
 * - JWT token-based authentication
 * - Method-level security with @PreAuthorize annotations
 * - Custom permission extraction from database via JwtAuthenticationConverter
 * - Stateless session management (suitable for microservices)
 */
//@Configuration
//@EnableWebSecurity
//@EnableMethodSecurity(prePostEnabled = true)
@RequiredArgsConstructor
    @Deprecated
public class SecurityConfig {
    
    private final JwtAuthenticationConverter jwtAuthenticationConverter;

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Public endpoints
                        .requestMatchers(
                                "/api/*/auth/login",
                                "/api/*/auth/register",
                                "/api/*/auth/refresh-token",
                                "/actuator/health"
                        ).permitAll()
                        // All other requests require authentication
                        .anyRequest().authenticated()
                )
                .oauth2ResourceServer(oauth2 -> oauth2
                        .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter))
                );
        
        return http.build();
    }
}


