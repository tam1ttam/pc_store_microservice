package com.tam.identity.services.impl;

import com.tam.identity.dtos.request.auth.LoginRequest;
import com.tam.identity.dtos.request.auth.RegisterRequest;
import com.tam.identity.dtos.response.auth.AuthTokenResponse;
import com.tam.identity.dtos.response.auth.LoginResult;
import com.tam.identity.dtos.response.auth.RegisterResponse;
import com.tam.identity.entity.Role;
import com.tam.identity.entity.User;
import com.tam.identity.repositories.RoleRepository;
import com.tam.identity.repositories.UserRepository;
import com.tam.identity.services.AuthService;
import com.tam.identity.services.KeycloakAuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {
    private final KeycloakAuthService keycloakAuthService;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    @Override
    public RegisterResponse register(RegisterRequest request) {
        log.info("Starting registration process for user: {}", request.getPhoneNumber());
        
        try {
            // Step 1: Register user in Keycloak and get identityUserId
            RegisterResponse registerResponse = keycloakAuthService.register(request);
            String identityUserId = registerResponse.getUserId();
            
            log.info("User registered in Keycloak with ID: {}", identityUserId);
            
            // Step 2: Save user to internal database
            User user = User.builder()
                    .identityUserId(identityUserId)
                    .roles(new HashSet<>())
                    .build();
            
            userRepository.save(user);
            log.info("User saved to internal database: {}", identityUserId);
            
            // Step 3: Assign default role (GUEST)
            Optional<Role> defaultRole = roleRepository.findById("GUEST");
            if (defaultRole.isPresent()) {
                Set<Role> roles = new HashSet<>();
                roles.add(defaultRole.get());
                user.setRoles(roles);
                userRepository.save(user);
                log.info("Default role 'GUEST' assigned to user: {}", identityUserId);
            } else {
                log.warn("Default role 'GUEST' not found in database");
            }
            
            // Step 4: Call gRPC to User Service to create profile
            // TODO: Implement gRPC call to User Service
            log.info("Profile creation request should be sent to User Service (gRPC)");
            
            return registerResponse;
            
        } catch (Exception e) {
            log.error("Error during registration process", e);
            throw new RuntimeException("Registration failed: " + e.getMessage(), e);
        }
    }

    @Override
    public LoginResult login(LoginRequest request) {
        AuthTokenResponse tokens = keycloakAuthService.login(request.getUsername(), request.getPassword());
        
        return LoginResult.builder()
                .accessToken(tokens.getAccessToken())
                .refreshToken(tokens.getRefreshToken())
                .tokenType(tokens.getTokenType())
                .expiresIn(tokens.getExpiresIn())
                .build();
    }

    @Override
    public LoginResult loginWithGoogle() {
        return null;
    }

    @Override
    public LoginResult refreshToken(String refreshToken) {
        AuthTokenResponse tokenResponse = keycloakAuthService.refreshToken(refreshToken);
        
        return LoginResult.builder()
                .accessToken(tokenResponse.getAccessToken())
                .refreshToken(tokenResponse.getRefreshToken())
                .tokenType(tokenResponse.getTokenType())
                .expiresIn(tokenResponse.getExpiresIn())
                .build();
    }

    @Override
    public void logout(String refreshToken) {
        keycloakAuthService.revokeRefreshToken(refreshToken);
    }
}
