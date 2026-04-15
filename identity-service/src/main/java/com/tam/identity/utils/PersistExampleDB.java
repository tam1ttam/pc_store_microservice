package com.tam.identity.utils;

import com.tam.identity.entity.Permission;
import com.tam.identity.entity.Role;
import com.tam.identity.repositories.PermissionRepository;
import com.tam.identity.repositories.RoleRepository;
import jakarta.transaction.Transactional;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

import java.util.*;
import java.util.stream.Collectors;

@Component
public class PersistExampleDB implements ApplicationRunner {
    private static final List<String> ENTITIES = Arrays.asList(
            "PRODUCT",
            "ORDER",
            "PAYMENT",
            "USER",
            "MEDIA",
            "NOTIFICATION",
            "ROLE",
            "PERMISSION"
    );
    private static final List<String> ACTIONS = Arrays.asList("CREATE", "READ", "UPDATE", "DELETE");

    private final PermissionRepository permissionRepository;
    private final RoleRepository roleRepository;

    public PersistExampleDB(PermissionRepository permissionRepository, RoleRepository roleRepository) {
        this.permissionRepository = permissionRepository;
        this.roleRepository = roleRepository;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        if (permissionRepository.count() > 0 || roleRepository.count() > 0) {
            return;
        }

        List<Permission> permissions = new ArrayList<>();
        for (String entity : ENTITIES) {
            for (String action : ACTIONS) {
                String name = permissionName(entity, action);
                permissions.add(Permission.builder()
                        .name(name)
                        .description("Allow " + action.toLowerCase() + " " + entity.toLowerCase())
                        .build());
            }
        }

        permissionRepository.saveAll(permissions);
        Map<String, Permission> permissionByName = permissions.stream()
                .collect(Collectors.toMap(Permission::getName, p -> p));

        Role guest = Role.builder()
                .name("GUEST")
                .permissions(selectPermissions(permissionByName, Arrays.asList("PRODUCT", "MEDIA"), Collections.singletonList("READ")))
                .build();

        Role seller = Role.builder()
                .name("SELLER")
                .permissions(selectPermissions(permissionByName, Arrays.asList("PRODUCT", "MEDIA", "ORDER"), ACTIONS))
                .build();

        Role owner = Role.builder()
                .name("OWNER")
                .permissions(new HashSet<>(permissions))
                .build();

        roleRepository.saveAll(Arrays.asList(guest, seller, owner));
    }

    private static String permissionName(String entity, String action) {
        return entity + "_" + action;
    }

    private static Set<Permission> selectPermissions(
            Map<String, Permission> permissionByName,
            List<String> entities,
            List<String> actions
    ) {
        Set<Permission> selected = new HashSet<>();
        for (String entity : entities) {
            for (String action : actions) {
                Permission permission = permissionByName.get(permissionName(entity, action));
                if (permission != null) {
                    selected.add(permission);
                }
            }
        }
        return selected;
    }
}
