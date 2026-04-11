package com.tam.identity.services;

import com.tam.identity.entity.Permission;
import java.util.List;
import java.util.Optional;

public interface PermissionService {
    /**
     * Create a new permission
     */
    Permission createPermission(Permission permission);

    /**
     * Get permission by name
     */
    Optional<Permission> getPermissionByName(String name);

    /**
     * Get all permissions
     */
    List<Permission> getAllPermissions();

    /**
     * Update a permission
     */
    Permission updatePermission(String name, Permission permission);

    /**
     * Delete a permission by name
     */
    void deletePermission(String name);

    /**
     * Check if permission exists
     */
    boolean permissionExists(String name);
}
