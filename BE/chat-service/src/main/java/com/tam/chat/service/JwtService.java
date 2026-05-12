package com.tam.chat.service;

import java.util.Date;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.SignedJWT;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
public class JwtService {

    @Value("${jwt.signerKey}")
    private String signerKey;

    /**
     * Validates the JWT signature and expiry locally.
     * @return the identity userId (JWT subject), or null if invalid
     */
    public String extractUserIdFromToken(String token) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(token);
            MACVerifier verifier = new MACVerifier(signerKey.getBytes());

            if (!signedJWT.verify(verifier)) {
                log.warn("JWT signature verification failed");
                return null;
            }

            Date expiry = signedJWT.getJWTClaimsSet().getExpirationTime();
            if (expiry == null || expiry.before(new Date())) {
                log.warn("JWT is expired");
                return null;
            }

            return signedJWT.getJWTClaimsSet().getSubject();
        } catch (Exception e) {
            log.warn("JWT parse/verify error: {}", e.getMessage());
            return null;
        }
    }
}
