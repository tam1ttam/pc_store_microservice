package com.tam.identity.services.impl;

import com.tam.identity.entity.Permission;
import com.tam.identity.entity.Role;
import com.tam.identity.entity.User;
import com.tam.identity.repositories.UserRepository;
import com.tam.identity.services.KeycloakAuthService;
import com.tam.identity.services.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;

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

        // Iterate through all roles of the user
        if (user.getRoles() != null && !user.getRoles().isEmpty()) {
            for (Role role : user.getRoles()) {
                // Collect all permissions from each role
                if (role.getPermissions() != null && !role.getPermissions().isEmpty()) {
                    for (Permission permission : role.getPermissions()) {
                        permissions.add(permission.getName());
                    }
                }
            }
        }

        log.debug("User {} has {} permissions", identityUserId, permissions.size());
        return permissions;
    }
}
