package com.tam.identity.clients;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tam.identity.dtos.response.auth.GoogleUserInfo;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import tam.common.exceptions.InvalidParamException;

@Component
@RequiredArgsConstructor
@Slf4j
public class GoogleTokenVerifierClient {
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${google.client.id}")
    private String googleClientId;

    private static final String GOOGLE_TOKEN_INFO_URL = "https://www.googleapis.com/oauth2/v3/tokeninfo";

    public GoogleUserInfo verifyGoogleToken(String idToken) {
        try {
            String url = GOOGLE_TOKEN_INFO_URL + "?id_token=" + idToken;
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                GoogleUserInfo userInfo = objectMapper.readValue(response.getBody(), GoogleUserInfo.class);
                
                // Verify the token is for our client
                if (!userInfo.getSub().isEmpty()) {
                    return userInfo;
                }
            }
            throw new InvalidParamException("Invalid Google token");
        } catch (Exception ex) {
            log.error("Failed to verify Google token", ex);
            throw new InvalidParamException("Failed to verify Google token: " + ex.getMessage());
        }
    }
}
