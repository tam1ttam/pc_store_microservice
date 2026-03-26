package com.tam.identity.clients;

import com.tam.identity.dtos.request.auth.RegisterRequest;
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

import java.util.Map;

@Component
@Slf4j
@RequiredArgsConstructor
public class KeycloakIdentityClient {
    private final WebClient keycloakWebClient;

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

    public String createUser(RegisterRequest request) {
        // Create user in Keycloak
        Map<String, Object> userPayload = Map.of(
                "username", request.getPhoneNumber(),
                "email", request.getPhoneNumber() + "@example.com",
                "firstName", request.getFirstName() != null ? request.getFirstName() : "",
                "lastName", request.getLastName() != null ? request.getLastName() : "",
                "enabled", true,
                "credentials", new Object[]{
                        Map.of(
                                "type", "password",
                                "value", request.getPassword(),
                                "temporary", false
                        )
                }
        );

        String token = getAdminToken();

        String userId = keycloakWebClient
                .post()
                .uri("/admin/realms/{realm}/users", realm)
                .header("Authorization", "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .bodyValue(userPayload)
                .retrieve()
                .toEntity(String.class)
                .map(response -> {
                    String location = response.getHeaders().getLocation().toString();
                    return location.substring(location.lastIndexOf("/") + 1);
                })
                .block();

        log.info("User created in Keycloak with ID: {}", userId);
        return userId;
    }

    public void deleteUser(String userId) {
        String token = getAdminToken();
        keycloakWebClient
                .delete()
                .uri("/admin/realms/{realm}/users/{userId}", realm, userId)
                .header("Authorization", "Bearer " + token)
                .retrieve()
                .toBodilessEntity()
                .block();
        log.info("User deleted from Keycloak: {}", userId);
    }

    public AuthTokenResponse login(String phoneNumber, String password) {
        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("client_id", clientId);
        body.add("client_secret", clientSecret);
        body.add("grant_type", "password");
        body.add("username", phoneNumber);
        body.add("password", password);

        return keycloakWebClient
                .post()
                .uri("/realms/{realm}/protocol/openid-connect/token", realm)
                .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                .body(BodyInserters.fromFormData(body))
                .retrieve()
                .bodyToMono(AuthTokenResponse.class)
                .block();
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
}
