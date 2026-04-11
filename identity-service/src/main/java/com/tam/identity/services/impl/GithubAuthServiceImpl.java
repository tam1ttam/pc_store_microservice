package com.tam.identity.services.impl;

import com.tam.identity.clients.GithubTokenVerifierClient;
import com.tam.identity.clients.GrpcUserServiceClient;
import com.tam.identity.dtos.request.auth.GithubLoginRequest;
import com.tam.identity.dtos.request.auth.RegisterRequest;
import com.tam.identity.dtos.response.auth.AuthTokenResponse;
import com.tam.identity.dtos.response.auth.GithubUserInfo;
import com.tam.identity.dtos.response.auth.LoginResult;
import com.tam.identity.services.GithubAuthService;
import com.tam.identity.services.KeycloakAuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import tam.common.exceptions.InvalidParamException;

import java.time.LocalDate;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class GithubAuthServiceImpl implements GithubAuthService {
    private final GithubTokenVerifierClient githubTokenVerifierClient;
    private final KeycloakAuthService keycloakAuthService;
    private final GrpcUserServiceClient grpcUserServiceClient;

    @Override
    public LoginResult loginWithGithub(GithubLoginRequest request) {
        // Verify GitHub code and get user info
        GithubUserInfo githubUserInfo = githubTokenVerifierClient.verifyGithubCode(request.getCode());
        
        if (githubUserInfo == null || githubUserInfo.getId() == null) {
            throw new InvalidParamException("Invalid GitHub user information");
        }

        // Create a unique identity based on GitHub ID
        String identityUserId = githubUserInfo.getId();
        
        try {
            // Try to login with existing account
            AuthTokenResponse tokens = keycloakAuthService.loginWithGithub(identityUserId);
            return LoginResult.builder()
                    .accessToken(tokens.getAccessToken())
                    .refreshToken(tokens.getRefreshToken())
                    .tokenType(tokens.getTokenType())
                    .expiresIn(tokens.getExpiresIn())
                    .build();
        } catch (Exception ex) {
            // If user doesn't exist, register and then login
            log.info("User not found, attempting to register: {}", identityUserId);
            return registerWithGithub(request);
        }
    }

    @Override
    public LoginResult registerWithGithub(GithubLoginRequest request) {
        GithubUserInfo githubUserInfo = githubTokenVerifierClient.verifyGithubCode(request.getCode());
        
        if (githubUserInfo == null || githubUserInfo.getId() == null) {
            throw new InvalidParamException("Invalid GitHub user information");
        }

        String identityUserId = "github_" + githubUserInfo.getId();
        
        // Generate a temporary password (not used for GitHub login)
        String tempPassword = UUID.randomUUID().toString();
        
        // Extract first and last name from GitHub name
        String firstName = githubUserInfo.getLogin(); // Use login as first name
        String lastName = "";
        
        if (githubUserInfo.getName() != null && !githubUserInfo.getName().isEmpty()) {
            String[] nameParts = githubUserInfo.getName().split(" ", 2);
            firstName = nameParts[0];
            lastName = nameParts.length > 1 ? nameParts[1] : "";
        }
        
        // Create user registration request
        RegisterRequest registerRequest = RegisterRequest.builder()
                .phoneNumber(githubUserInfo.getEmail() != null ? githubUserInfo.getEmail() : githubUserInfo.getLogin() + "@github.com")
                .password(tempPassword)
                .firstName(firstName)
                .lastName(lastName)
                .gender("UNKNOWN")
                .dateOfBirth(LocalDate.now().minusYears(18))
                .avatar(githubUserInfo.getAvatar_url())
                .build();

        try {
            // Register in Keycloak
            keycloakAuthService.register(registerRequest);
            
            // Create user profile in User Service via gRPC
            grpcUserServiceClient.register(registerRequest, identityUserId);
            
            // Login after registration
            AuthTokenResponse tokens = keycloakAuthService.loginWithGithub(identityUserId);
            
            return LoginResult.builder()
                    .accessToken(tokens.getAccessToken())
                    .refreshToken(tokens.getRefreshToken())
                    .tokenType(tokens.getTokenType())
                    .expiresIn(tokens.getExpiresIn())
                    .build();
        } catch (Exception ex) {
            log.error("Failed to register user with GitHub", ex);
            throw new InvalidParamException("Failed to register with GitHub: " + ex.getMessage());
        }
    }
}
