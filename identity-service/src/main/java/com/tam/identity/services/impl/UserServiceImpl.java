package com.tam.identity.services.impl;

import com.tam.identity.clients.GrpcUserServiceClient;
import com.tam.identity.clients.KeycloakIdentityClient;
import com.tam.identity.dtos.response.auth.AuthTokenResponse;
import com.tam.identity.dtos.response.auth.DeleteAccountResponse;
import com.tam.identity.dtos.response.auth.MeResponse;
import com.tam.identity.dtos.response.auth.UserProfileGrpcResponse;
import com.tam.identity.entity.User;

import com.tam.identity.repositories.UserRepository;
import com.tam.identity.services.UserService;
import iuh.fit.pc_store.grpc.user.v1.CreateUserProfileRequest;
import iuh.fit.pc_store.grpc.user.v1.UserServiceGrpc;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.experimental.NonFinal;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import tam.common.exception.InvalidParamException;
import tam.common.exception.NotFoundException;

import java.lang.reflect.Field;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(makeFinal = true, level = AccessLevel.PRIVATE)
public class UserServiceImpl implements UserService {
    UserRepository userRepository;
     KeycloakIdentityClient keycloakIdentityClient;
     GrpcUserServiceClient userServiceGrpcClient;
    @NonFinal
    @Value("${app.auth-url:http://localhost:6060/api-gateway/identity-service/api/v1/auth}")
    private String identityServiceUrl;
    @Override
    public Set<String> getUserPermissions(String identityUserId) {
        log.info("Fetching permissions for user: {}", identityUserId);
        Set<String> permissions = new HashSet<>();
        Optional<User> userOptional = userRepository.findById(identityUserId);
        if (userOptional.isEmpty()) {
            log.warn("User not found with identityUserId: {}", identityUserId);
            return permissions;
        }

        User user = userOptional.get();

        log.debug("User {} has {} permissions", identityUserId, permissions.size());
        return permissions;
    }

    // ─── Keycloak OAuth2 Callbacks ──────────────────────────────────────────

    @Override
    public AuthTokenResponse handleRegisterCallback(String code) {
        try {
            log.info("[Register Callback] Processing registration callback with code: {}", code);
            String redirectUri = identityServiceUrl + "/callback/login";
            AuthTokenResponse tokens = keycloakIdentityClient.exchangeCode(code, redirectUri);
            String tokenToDecode = tokens.getAccessToken();
            Map<String, Object> allUserInfo = keycloakIdentityClient.decodeJwtPayload(tokenToDecode);
            Map<String, Object> allUserInfos = keycloakIdentityClient.decodeJwtPayload(String.valueOf(tokens));
            log.error("All user info");
            allUserInfo.forEach((k, v)-> System.out.println(k + ": " + v));
            log.error("All user infos");
            allUserInfos.forEach((k, v)-> System.out.println(k + ": " + v));
            String identityUserId = keycloakIdentityClient.extractSubFromAccessToken(tokens.getAccessToken());
            User user = userRepository.findById(identityUserId).orElse(null);
            UserProfileGrpcResponse userProfileGrpcResponse = UserProfileGrpcResponse.builder().build();
            if(Objects.isNull(user)){
                System.out.println("DANG KY MOI");
                user = User.builder().identityUserId(allUserInfo.get("sub").toString()).build();
                userRepository.save(user);
                // grpc profile
                 try {
                     CreateUserProfileRequest profileRequest = CreateUserProfileRequest.newBuilder()
                         .setIdentityUserId(identityUserId)
                             .setDefaultPhoneNumber("")
                             .setDateOfBirth("")
                             .setFirstName(allUserInfo.get("given_name").toString())
                             .setLastName(allUserInfo.get("family_name").toString())
                             .setDefaultEmail(allUserInfo.get("email").toString())
                         .build();
                     userServiceGrpcClient.createUserProfile(profileRequest);
                     userProfileGrpcResponse.setFirstName(allUserInfo.get("given_name").toString());
                     userProfileGrpcResponse.setLastName(allUserInfo.get("family_name").toString());
                     userProfileGrpcResponse.setDefaultEmail(allUserInfo.get("email").toString());
                     log.info("User profile created via gRPC for: {}", identityUserId);
                 } catch (Exception ex) {
                     log.error("Failed to create user profile via gRPC", ex);
                     ex.printStackTrace();
                 }
            }
            else{
                try {
                    userProfileGrpcResponse = userServiceGrpcClient.getUserProfileByIdentity(user.getIdentityUserId());
                    log.info("User profile found via gRPC for: {}", identityUserId);
                } catch (Exception ex) {
                    log.error("Failed to create user profile via gRPC", ex);
                    ex.printStackTrace();
                }
            }
            Map<String,Object> userProfile = new HashMap<>();
            for (Field field : userProfileGrpcResponse.getClass().getDeclaredFields()) {
                field.setAccessible(true);
                try {
                    String key = field.getName();
                    Object value = field.get(userProfileGrpcResponse);
                    if(Objects.nonNull(value))
                        userProfile.put(key, value);
                } catch (IllegalAccessException e) {
                    log.error("Cannot access field: {}", field.getName());
                    e.printStackTrace();
                }
            }
            tokens.setUserProfile(userProfile);
            return tokens;
        } catch (Exception ex) {
            log.error("[Register Callback] Error processing registration callback", ex);
            ex.printStackTrace();
            return null;
        }
    }

    @Override
    public DeleteAccountResponse handleDeleteAccountCallback(String code) {
        try {
            log.info("[Delete Account Callback] Processing delete account callback with code: {}", code);

            String redirectUri = identityServiceUrl + "/callback/delete-account";
            AuthTokenResponse tokens = keycloakIdentityClient.exchangeCode(code, redirectUri);
            String identityUserId = keycloakIdentityClient.extractSubFromAccessToken(tokens.getAccessToken());
            deleteUserIdentity(identityUserId);
            boolean isDeletedProfile = userServiceGrpcClient.deleteUserProfile(identityUserId);
            return DeleteAccountResponse.builder().isDeleted(isDeletedProfile).build();

        } catch (Exception ex) {
            log.error("[Delete Account Callback] Error processing delete account callback", ex);
            throw new RuntimeException("Failed to process delete account callback: " + ex.getMessage(), ex);
        }
    }

    @Override
    public MeResponse me(String accessToken) {
        Map<String, Object> claims = keycloakIdentityClient.decodeJwtPayload(accessToken);

        long exp = ((Number) claims.get("exp")).longValue();
        if (System.currentTimeMillis() / 1000 > exp) {
            return MeResponse.builder()
                    .isExpired(true)
                    .build();
        }

        String identityUserId = claims.get("sub").toString();
        var userProfileGrpc = userServiceGrpcClient.getUserProfileByIdentity(identityUserId);
        return MeResponse.builder()
                .userProfile(userProfileGrpc)
                .isExpired(false)
                .build();
    }

    @Override
    public AuthTokenResponse refreshAccessToken(String refreshToken) {
        return keycloakIdentityClient.refreshToken(refreshToken);
    }

    @Override
    public void revokeToken(String refreshToken) {
        keycloakIdentityClient.revokeRefreshToken(refreshToken);
    }


    // ─── Private Helper Methods ───────────────────────────────────────────────

    /**
     * Xóa identityUserId từ DB backend
     */
    private void deleteUserIdentity(String identityUserId) {
        Optional<User> userOpt = userRepository.findById(identityUserId);

        if (!userOpt.isPresent()) {
            throw new NotFoundException("User not found in database: " + identityUserId);
        }

        userRepository.delete(userOpt.get());
        log.info("User deleted from database: {}", identityUserId);
    }
}
