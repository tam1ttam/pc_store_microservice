package com.tam.identity.services.impl;

import com.tam.identity.entity.Role;
import com.tam.identity.repositories.RoleRepository;
import com.tam.identity.services.RoleService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class RoleServiceImpl implements RoleService {
    private final RoleRepository roleRepository;

    @Override
    public Role createRole(Role role) {
        log.info("Creating new role: {}", role.getName());
        if (roleRepository.existsById(role.getName())) {
            log.warn("Role already exists: {}", role.getName());
            throw new RuntimeException("Role already exists: " + role.getName());
        }
        return roleRepository.save(role);
    }

    @Override
    public Optional<Role> getRoleByName(String name) {
        log.debug("Fetching role: {}", name);
        return roleRepository.findById(name);
    }

    @Override
    public List<Role> getAllRoles() {
        log.debug("Fetching all roles");
        return roleRepository.findAll();
    }

    @Override
    public Role updateRole(String name, Role role) {
        log.info("Updating role: {}", name);
        return roleRepository.findById(name)
                .map(existingRole -> {
                    existingRole.setPermissions(role.getPermissions());
                    return roleRepository.save(existingRole);
                })
                .orElseThrow(() -> new RuntimeException("Role not found: " + name));
    }

    @Override
    public void deleteRole(String name) {
        log.info("Deleting role: {}", name);
        if (!roleRepository.existsById(name)) {
            log.warn("Role not found for deletion: {}", name);
            throw new RuntimeException("Role not found: " + name);
        }
        roleRepository.deleteById(name);
    }

    @Override
    public boolean roleExists(String name) {
        return roleRepository.existsById(name);
    }
}
