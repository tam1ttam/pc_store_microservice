package com.tam.identity.services;

import com.tam.identity.entity.Role;
import java.util.List;
import java.util.Optional;

public interface RoleService {
    /**
     * Create a new role
     */
    Role createRole(Role role);

    /**
     * Get role by name
     */
    Optional<Role> getRoleByName(String name);

    /**
     * Get all roles
     */
    List<Role> getAllRoles();

    /**
     * Update a role
     */
    Role updateRole(String name, Role role);

    /**
     * Delete a role by name
     */
    void deleteRole(String name);

    /**
     * Check if role exists
     */
    boolean roleExists(String name);
}
