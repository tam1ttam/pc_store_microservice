package com.tam.identity.clients;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tam.identity.dtos.response.auth.GithubAccessTokenResponse;
import com.tam.identity.dtos.response.auth.GithubUserInfo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import tam.common.exceptions.InvalidParamException;

@Component
@RequiredArgsConstructor
@Slf4j
public class GithubTokenVerifierClient {
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${github.client.id}")
    private String githubClientId;

    @Value("${github.client.secret}")
    private String githubClientSecret;

    private static final String GITHUB_TOKEN_URL = "https://github.com/login/oauth/access_token";
    private static final String GITHUB_USER_URL = "https://api.github.com/user";

    public GithubUserInfo verifyGithubCode(String code) {
        try {
            // Step 1: Exchange code for access token
            String accessToken = exchangeCodeForToken(code);
            
            if (accessToken == null || accessToken.isEmpty()) {
                throw new InvalidParamException("Failed to get GitHub access token");
            }

            // Step 2: Get user info using access token
            return getUserInfo(accessToken);
        } catch (Exception ex) {
            log.error("Failed to verify GitHub code", ex);
            throw new InvalidParamException("Failed to verify GitHub code: " + ex.getMessage());
        }
    }

    private String exchangeCodeForToken(String code) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Accept", "application/json");

            String body = String.format(
                    "{\"client_id\":\"%s\",\"client_secret\":\"%s\",\"code\":\"%s\"}",
                    githubClientId, githubClientSecret, code
            );

            HttpEntity<String> request = new HttpEntity<>(body, headers);
            ResponseEntity<String> response = restTemplate.postForEntity(GITHUB_TOKEN_URL, request, String.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                GithubAccessTokenResponse tokenResponse = objectMapper.readValue(
                        response.getBody(),
                        GithubAccessTokenResponse.class
                );

                if (tokenResponse.getError() != null) {
                    throw new InvalidParamException("GitHub error: " + tokenResponse.getError());
                }

                return tokenResponse.getAccessToken();
            }
            throw new InvalidParamException("Failed to exchange code for token");
        } catch (Exception ex) {
            log.error("Failed to exchange GitHub code for token", ex);
            throw new InvalidParamException("Failed to exchange GitHub code: " + ex.getMessage());
        }
    }

    private GithubUserInfo getUserInfo(String accessToken) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + accessToken);
            headers.set("Accept", "application/vnd.github.v3+json");

            HttpEntity<String> request = new HttpEntity<>(headers);
            ResponseEntity<String> response = restTemplate.exchange(
                    GITHUB_USER_URL,
                    HttpMethod.GET,
                    request,
                    String.class
            );

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return objectMapper.readValue(response.getBody(), GithubUserInfo.class);
            }
            throw new InvalidParamException("Failed to get GitHub user info");
        } catch (Exception ex) {
            log.error("Failed to get GitHub user info", ex);
            throw new InvalidParamException("Failed to get GitHub user info: " + ex.getMessage());
        }
    }
}
