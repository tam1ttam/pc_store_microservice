package com.tam.identity.services.impl;

import com.tam.identity.clients.GoogleTokenVerifierClient;
import com.tam.identity.clients.GrpcUserServiceClient;
import com.tam.identity.dtos.request.auth.GoogleLoginRequest;
import com.tam.identity.dtos.request.auth.RegisterRequest;
import com.tam.identity.dtos.response.auth.AuthTokenResponse;
import com.tam.identity.dtos.response.auth.GoogleUserInfo;
import com.tam.identity.dtos.response.auth.LoginResult;
import com.tam.identity.dtos.response.auth.RegisterResponse;
import com.tam.identity.services.GoogleAuthService;
import com.tam.identity.services.KeycloakAuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import tam.common.exception.InvalidParamException;

import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class GoogleAuthServiceImpl implements GoogleAuthService {
    private final GoogleTokenVerifierClient googleTokenVerifierClient;
    private final KeycloakAuthService keycloakAuthService;
    private final GrpcUserServiceClient grpcUserServiceClient;

    @Override
    public LoginResult loginWithGoogle(GoogleLoginRequest request) {
        // Verify Google token
        GoogleUserInfo googleUserInfo = googleTokenVerifierClient.verifyGoogleToken(request.getIdToken());
        
        if (googleUserInfo == null || googleUserInfo.getSub().isEmpty()) {
            throw new InvalidParamException("Invalid Google user information");
        }

        // Create a unique identity based on Google sub
        String identityUserId = googleUserInfo.getSub();
        
        try {
            // Try to login with existing account
            AuthTokenResponse tokens = keycloakAuthService.loginWithGoogle(identityUserId);
            return LoginResult.builder()
                    .accessToken(tokens.getAccessToken())
                    .refreshToken(tokens.getRefreshToken())
                    .tokenType(tokens.getTokenType())
                    .expiresIn(tokens.getExpiresIn())
                    .build();
        } catch (Exception ex) {
            // If user doesn't exist, register and then login
            log.info("User not found, attempting to register: {}", identityUserId);
            return registerWithGoogle(request);
        }
    }

    @Override
    public LoginResult registerWithGoogle(GoogleLoginRequest request) {
        GoogleUserInfo googleUserInfo = googleTokenVerifierClient.verifyGoogleToken(request.getIdToken());
        
        if (googleUserInfo == null || googleUserInfo.getSub().isEmpty()) {
            throw new InvalidParamException("Invalid Google user information");
        }

        String identityUserId =  googleUserInfo.getSub();
        
        // Generate a temporary password (not used for Google login)
        String tempPassword = UUID.randomUUID().toString();
        
        // Create user in Keycloak
        RegisterRequest registerRequest = RegisterRequest.builder()
                .phoneNumber(googleUserInfo.getEmail()) // Use email as phone for identification
                .password(tempPassword)
                .firstName(googleUserInfo.getGiven_name() != null ? googleUserInfo.getGiven_name() : "")
                .lastName(googleUserInfo.getFamily_name() != null ? googleUserInfo.getFamily_name() : "")
                .gender("UNKNOWN")
                .dateOfBirth(LocalDate.now().minusYears(18))
                .avatar(googleUserInfo.getPicture())
                .build();

        try {
            // Register in Keycloak
            RegisterResponse registerResponse = keycloakAuthService.register(registerRequest);
            
            // Create user profile in User Service via gRPC
            grpcUserServiceClient.register(registerRequest, identityUserId);
            
            // Login after registration
            AuthTokenResponse tokens = keycloakAuthService.loginWithGoogle(identityUserId);

            return LoginResult.builder()
                    .accessToken(tokens.getAccessToken())
                    .refreshToken(tokens.getRefreshToken())
                    .tokenType(tokens.getTokenType())
                    .expiresIn(tokens.getExpiresIn())
                    .build();
        } catch (Exception ex) {
            log.error("Failed to register user with Google", ex);
            throw new InvalidParamException("Failed to register with Google: " + ex.getMessage());
        }
    }
}
