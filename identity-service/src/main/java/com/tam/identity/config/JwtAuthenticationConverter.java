package com.tam.identity.config;

import com.tam.identity.services.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Custom JWT Authentication Converter that enriches JWT tokens with permissions from the database.
 * 
 * This converter:
 * 1. Extracts the user ID (sub claim) from JWT token
 * 2. Fetches all permissions for this user from the database
 * 3. Converts permissions to Spring Security GrantedAuthorities
 * 4. Attaches them to the security context for use with @PreAuthorize annotations
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class JwtAuthenticationConverter implements Converter<Jwt, AbstractAuthenticationToken> {
    
    private final UserService userService;

    @Override
    public AbstractAuthenticationToken convert(Jwt jwt) {
        log.debug("Converting JWT token to authentication token");
        
        // Extract user ID from JWT 'sub' claim
        String userId = jwt.getSubject();
        log.debug("Extracted user ID from JWT: {}", userId);
        
        try {
            // Fetch all permissions for this user from database
            Set<String> permissions = userService.getUserPermissions(userId);
            log.debug("Retrieved {} permissions for user: {}", permissions.size(), userId);
            
            // Convert permissions to Spring Security authorities
            Collection<GrantedAuthority> authorities = convertPermissionsToAuthorities(permissions);
            
            // Create and return authentication token with authorities
            JwtAuthenticationToken token = new JwtAuthenticationToken(jwt, authorities);
            log.debug("JWT authentication token created with {} authorities for user: {}", 
                    authorities.size(), userId);
            
            return token;
        } catch (Exception e) {
            log.error("Error converting JWT token for user: {}", userId, e);
            // Return token with no authorities if error occurs
            return new JwtAuthenticationToken(jwt, new HashSet<>());
        }
    }

    /**
     * Convert permission names to Spring Security GrantedAuthority objects
     * 
     * @param permissions Set of permission names (e.g., "CREATE_POST", "DELETE_USER")
     * @return Collection of GrantedAuthority objects
     */
    private Collection<GrantedAuthority> convertPermissionsToAuthorities(Set<String> permissions) {
        return permissions.stream()
                .map(permission -> new SimpleGrantedAuthority("PERM_" + permission))
                .collect(Collectors.toSet());
    }
}
