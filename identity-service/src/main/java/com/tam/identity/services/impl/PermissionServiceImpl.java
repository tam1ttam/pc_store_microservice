package com.tam.identity.services.impl;

import com.tam.identity.entity.Permission;
import com.tam.identity.repositories.PermissionRepository;
import com.tam.identity.services.PermissionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PermissionServiceImpl implements PermissionService {
    private final PermissionRepository permissionRepository;

    @Override
    public Permission createPermission(Permission permission) {
        log.info("Creating new permission: {}", permission.getName());
        if (permissionRepository.existsById(permission.getName())) {
            log.warn("Permission already exists: {}", permission.getName());
            throw new RuntimeException("Permission already exists: " + permission.getName());
        }
        return permissionRepository.save(permission);
    }

    @Override
    public Optional<Permission> getPermissionByName(String name) {
        log.debug("Fetching permission: {}", name);
        return permissionRepository.findById(name);
    }

    @Override
    public List<Permission> getAllPermissions() {
        log.debug("Fetching all permissions");
        return permissionRepository.findAll();
    }

    @Override
    public Permission updatePermission(String name, Permission permission) {
        log.info("Updating permission: {}", name);
        return permissionRepository.findById(name)
                .map(existingPermission -> {
                    existingPermission.setDescription(permission.getDescription());
                    return permissionRepository.save(existingPermission);
                })
                .orElseThrow(() -> new RuntimeException("Permission not found: " + name));
    }

    @Override
    public void deletePermission(String name) {
        log.info("Deleting permission: {}", name);
        if (!permissionRepository.existsById(name)) {
            log.warn("Permission not found for deletion: {}", name);
            throw new RuntimeException("Permission not found: " + name);
        }
        permissionRepository.deleteById(name);
    }

    @Override
    public boolean permissionExists(String name) {
        return permissionRepository.existsById(name);
    }
}
