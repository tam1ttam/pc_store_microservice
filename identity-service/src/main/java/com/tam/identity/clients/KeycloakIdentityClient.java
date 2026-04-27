package com.tam.identity.clients;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JavaType;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tam.identity.dtos.response.auth.AuthTokenResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.core.ParameterizedTypeReference;
import tam.common.exception.NotFoundException;

import java.util.List;
import java.util.Map;

@Component
@Slf4j
@RequiredArgsConstructor
public class KeycloakIdentityClient {
    private final WebClient keycloakWebClient;

    private static final String SOCIAL_LOGIN_PASSWORD = "social-login-token";

    @Value("${app.security.keycloak.realm}")
    private String realm;

    @Value("${app.security.keycloak.client-id}")
    private String clientId;

    @Value("${app.security.keycloak.client-secret}")
    private String clientSecret;

    @Value("${app.security.keycloak.admin-client-id}")
    private String adminClientId;

    @Value("${app.security.keycloak.admin-client-secret}")
    private String adminClientSecret;

//    public String createUser(RegisterRequest request) {
//        // Create user in Keycloak
//        Map<String, Object> userPayload = Map.of(
//                "username", request.getPhoneNumber(),
//                "email", request.getEmail() != null && !request.getEmail().isBlank() ?
//                        request.getEmail() : request.getPhoneNumber() + "@example.com",
//                "firstName", request.getFirstName() != null ? request.getFirstName() : "",
//                "lastName", request.getLastName() != null ? request.getLastName() : "",
//                "enabled", true,
//                "credentials", new Object[]{
//                        Map.of(
//                                "type", "password",
//                                "value", request.getPassword(),
//                                "temporary", false
//                        )
//                }
//        );
//
//        String token = getAdminToken();
//
//        String userId = keycloakWebClient
//                .post()
//                .uri("/admin/realms/{realm}/users", realm)
//                .header("Authorization", "Bearer " + token)
//                .contentType(MediaType.APPLICATION_JSON)
//                .bodyValue(userPayload)
//                .retrieve()
//                .toEntity(String.class)
//                .map(response -> {
//                    String location = response.getHeaders().getLocation().toString();
//                    return location.substring(location.lastIndexOf("/") + 1);
//                })
//                .block();
//
//        log.info("User created in Keycloak with ID: {}", userId);
//        return userId;
//    }
//
//    public void deleteUser(String userId) {
//        String token = getAdminToken();
//        keycloakWebClient
//                .delete()
//                .uri("/admin/realms/{realm}/users/{userId}", realm, userId)
//                .header("Authorization", "Bearer " + token)
//                .retrieve()
//                .toBodilessEntity()
//                .block();
//        log.info("User deleted from Keycloak: {}", userId);
//    }
//
//    public AuthTokenResponse login(String username, String password) {
//        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
//        body.add("client_id", clientId);
//        body.add("client_secret", clientSecret);
//        body.add("grant_type", "password");
//        body.add("username", username); // Can be email or phoneNumber
//        body.add("password", password);
//
//        return keycloakWebClient
//                .post()
//                .uri("/realms/{realm}/protocol/openid-connect/token", realm)
//                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
//                .body(BodyInserters.fromFormData(body))
//                .retrieve()
//                .bodyToMono(AuthTokenResponse.class)
//                .block();
//    }

//    public AuthTokenResponse loginWithGoogle(String identityUserId) {
//        return loginWithSocialIdentity(identityUserId, "google");
//    }
//
//    public AuthTokenResponse loginWithGithub(String identityUserId) {
//        return loginWithSocialIdentity(identityUserId, "github");
//    }
//
//    private AuthTokenResponse loginWithSocialIdentity(String identityUserId, String provider) {
//        String token = getAdminToken();
//        Map<String, Object> user = findUserByIdOrUsername(identityUserId, provider, token);
//        if (user == null) {
//            log.warn("No Keycloak user found for {} identity: {}", provider, identityUserId);
//            throw new IllegalArgumentException("User not found for social login");
//        }
//
//        String userId = (String) user.get("id");
//        String username = (String) user.get("username");
//        if ((username == null || username.isBlank()) && user.get("email") instanceof String) {
//            username = (String) user.get("email");
//        }
//        if (username == null || username.isBlank()) {
//            throw new IllegalStateException("Keycloak username is missing for social login");
//        }
//
//        resetPassword(userId, token);
//        return login(username, SOCIAL_LOGIN_PASSWORD);
//    }

//    public AuthTokenResponse loginBySocialId(String prefixedSocialId) {
//        Map<String, Object> user = findUserByUsername(prefixedSocialId, getAdminToken());
//        if (user == null) {
//            throw new NotFoundException("No Keycloak user found: " + prefixedSocialId);
//        }
//        // Lấy username thực trong Keycloak để login
//        String username = (String) user.get("username");
//        return login(username, SOCIAL_LOGIN_PASSWORD);
//    }
//
//    private void resetPassword(String userId, String token) {
//        Map<String, Object> payload = Map.of(
//                "type", "password",
//                "value", SOCIAL_LOGIN_PASSWORD,
//                "temporary", false
//        );
//
//        keycloakWebClient
//                .put()
//                .uri("/admin/realms/{realm}/users/{userId}/reset-password", realm, userId)
//                .header("Authorization", "Bearer " + token)
//                .contentType(MediaType.APPLICATION_JSON)
//                .bodyValue(payload)
//                .retrieve()
//                .toBodilessEntity()
//                .block();
//    }
//
//    private Map<String, Object> findUserByIdOrUsername(String identityUserId, String provider, String token) {
//        Map<String, Object> user = getUserById(identityUserId, token);
//        if (user != null) {
//            return user;
//        }
//
//        user = findUserByUsername(identityUserId, token);
//        if (user != null) {
//            return user;
//        }
//
//        user = findUserByEmail(identityUserId, token);
//        if (user != null) {
//            return user;
//        }
//
//        String prefixedIdentity = provider + "_" + identityUserId;
//        user = findUserByUsername(prefixedIdentity, token);
//        if (user != null) {
//            return user;
//        }
//
//        return findUserByEmail(prefixedIdentity, token);
//    }

    private Map<String, Object> getUserById(String userId, String token) {
        try {
            return keycloakWebClient
                    .get()
                    .uri("/admin/realms/{realm}/users/{userId}", realm, userId)
                    .header("Authorization", "Bearer " + token)
                    .retrieve()
                    .bodyToMono(new ParameterizedTypeReference<Map<String, Object>>() {})
                    .block();
        } catch (Exception ex) {
            return null;
        }
    }

    private Map<String, Object> findUserByUsername(String username, String token) {
        return findUserByQuery("username", username, token);
    }

    private Map<String, Object> findUserByEmail(String email, String token) {
        return findUserByQuery("email", email, token);
    }

    private Map<String, Object> findUserByQuery(String field, String value, String token) {
        List<Map<String, Object>> users = keycloakWebClient
                .get()
                .uri(uriBuilder -> uriBuilder
                        .path("/admin/realms/{realm}/users")
                        .queryParam(field, value)
                        .queryParam("exact", "true")
                        .build(realm))
                .header("Authorization", "Bearer " + token)
                .retrieve()
                .bodyToMono(new ParameterizedTypeReference<List<Map<String, Object>>>() {})
                .block();

        if (users == null || users.isEmpty()) {
            return null;
        }

        return users.get(0);
    }

    public AuthTokenResponse refreshToken(String refreshToken) {
        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("client_id", clientId);
        body.add("client_secret", clientSecret);
        body.add("grant_type", "refresh_token");
        body.add("refresh_token", refreshToken);

        return keycloakWebClient
                .post()
                .uri("/realms/{realm}/protocol/openid-connect/token", realm)
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(BodyInserters.fromFormData(body))
                .retrieve()
                .bodyToMono(AuthTokenResponse.class)
                .block();
    }

    public void revokeRefreshToken(String refreshToken) {
        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("client_id", clientId);
        body.add("client_secret", clientSecret);
        body.add("refresh_token", refreshToken);

        keycloakWebClient
                .post()
                .uri("/realms/{realm}/protocol/openid-connect/logout", realm)
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(BodyInserters.fromFormData(body))
                .retrieve()
                .toBodilessEntity()
                .block();
    }

    /**
     * Exchange authorization code để lấy token từ Keycloak
     * Dùng cho OAuth2 callback flow
     */
    public AuthTokenResponse exchangeCode(String code, String redirectUri) {
        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("client_id", clientId);
        body.add("client_secret", clientSecret);
        body.add("grant_type", "authorization_code");
        body.add("code", code);
        body.add("redirect_uri", redirectUri);
        log.error(">>> DEBUG exchangeCode | client_id={}, redirect_uri={}, code={}",
                clientId, redirectUri, code);
        try {
            return keycloakWebClient
                    .post()
                    .uri("/realms/{realm}/protocol/openid-connect/token", realm)
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(BodyInserters.fromFormData(body))
                    .retrieve()
                    .onStatus(
                            status -> status.is4xxClientError() || status.is5xxServerError(),
                            response -> response.bodyToMono(String.class)
                                    .doOnNext(errorBody ->
                                            log.error("Keycloak token error | status={}, body={}",
                                                    response.statusCode(), errorBody))
                                    .map(errorBody -> new RuntimeException(
                                            "Keycloak rejected token exchange: " + errorBody))
                    )
                    .bodyToMono(AuthTokenResponse.class)
                    .block();
        } catch (Exception ex) {
            log.error("Failed to exchange authorization code", ex);
            throw new RuntimeException("Failed to exchange authorization code", ex);
        }
    }

    /**
     * Extract identityUserId (sub claim) từ access token
     * Sub claim chứa Keycloak user ID (identityUserId)
     */
    public String extractSubFromAccessToken(String accessToken) {
        try {
            // Decode JWT token để lấy claims
            String[] parts = accessToken.split("\\.");
            if (parts.length != 3) {
                throw new IllegalArgumentException("Invalid JWT token format");
            }

            // Decode payload (part[1])
            String payload = parts[1];
            // Add padding nếu cần
            int padding = 4 - (payload.length() % 4);
            if (padding != 4) {
                payload += "=".repeat(padding);
            }

            byte[] decodedBytes = java.util.Base64.getUrlDecoder().decode(payload);
            String decodedPayload = new String(decodedBytes);

            // Parse JSON để lấy "sub" claim
            Map<String, Object> claims = parseJsonString(decodedPayload);
            String sub = (String) claims.get("sub");

            if (sub == null || sub.isEmpty()) {
                throw new IllegalArgumentException("Sub claim not found in access token");
            }

            log.debug("Extracted sub from access token: {}", sub);
            return sub;

        } catch (Exception ex) {
            log.error("Failed to extract sub from access token", ex);
            throw new RuntimeException("Failed to extract sub from access token", ex);
        }
    }

    /**
     * Parse JSON string thành Map
     */
    private Map<String, Object> parseJsonString(String json) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            return mapper.readValue(json, new TypeReference<Map<String, Object>>() {});
        } catch (Exception ex) {
            log.error("Failed to parse JSON", ex);
            throw new RuntimeException("Failed to parse JSON", ex);
        }
    }

    private String getAdminToken() {
        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("client_id", adminClientId);
        body.add("client_secret", adminClientSecret);
        body.add("grant_type", "client_credentials");

        return keycloakWebClient
                .post()
                .uri("/realms/{realm}/protocol/openid-connect/token", realm)
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(BodyInserters.fromFormData(body))
                .retrieve()
                .bodyToMono(AuthTokenResponse.class)
                .map(AuthTokenResponse::getAccessToken)
                .block();
    }

    public Map<String, Object> decodeJwtPayload(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length < 2) return Map.of();

            String payload = parts[1];
            byte[] decodedBytes = java.util.Base64.getUrlDecoder().decode(payload);
            return parseJsonString(new String(decodedBytes));
        } catch (Exception ex) {
            log.error("Failed to decode JWT payload", ex);
            return Map.of();
        }
    }
}
