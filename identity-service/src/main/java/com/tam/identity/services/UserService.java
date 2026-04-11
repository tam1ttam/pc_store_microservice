package com.tam.identity.services;

import java.util.Set;

public interface UserService {
    /**
     * Get all permissions for a user by their Keycloak identity ID
     * @param identityUserId the user's identity ID from Keycloak
     * @return a set of permission names that the user has
     */
    Set<String> getUserPermissions(String identityUserId);
}
