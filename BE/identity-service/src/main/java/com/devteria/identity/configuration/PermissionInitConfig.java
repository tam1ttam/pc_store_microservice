package com.devteria.identity.configuration;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;

import com.devteria.identity.constant.PredefinedRole;
import com.devteria.identity.entity.Permission;
import com.devteria.identity.entity.Role;
import com.devteria.identity.repository.PermissionRepository;
import com.devteria.identity.repository.RoleRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Configuration
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class PermissionInitConfig {

    // ── identity-service ──────────────────────────────────────────────────────

    static final List<Permission> IDENTITY_PERMISSIONS = List.of(
            p("PERMISSION_LIST", "List all permissions"),
            p("PERMISSION_CREATE", "Create a permission"),
            p("PERMISSION_DELETE", "Delete a permission"),
            p("USER_LIST", "List all users"),
            p("USER_CREATE", "Create a user"),
            p("USER_UPDATE", "Update a user"),
            p("USER_DELETE", "Delete a user"),
            p("USER_DETAIL", "Get user detail"),
            p("MY_INFO", "Get my own info"),
            p("ROLE_LIST", "List all roles"),
            p("ROLE_CREATE", "Create a role"),
            p("ROLE_DELETE", "Delete a role"),
            p("ADMIN_UPDATE_ROLE", "Admin update user role"),
            p("ADMIN_HISTORY", "Admin view action history"),
            p("INTERNAL_MANAGER_LIST", "Internal list of managers"),
            p("INTERNAL_MANAGER_DETAILS", "Internal manager details with username"));

    // ── user-service ──────────────────────────────────────────────────────────

    static final List<Permission> USER_PERMISSIONS = List.of(
            p("CUSTOMER_REGISTER", "Register a new customer profile"),
            p("CUSTOMER_DETAIL", "Get own customer profile"),
            p("CUSTOMER_UPDATE", "Update own customer profile"),
            p("ADMIN_CUSTOMER_LIST", "Admin list all customers"),
            p("ADMIN_CUSTOMER_COUNT", "Admin count customers"),
            p("ADMIN_CUSTOMER_DETAIL", "Admin get customer detail"),
            p("ADMIN_CUSTOMER_UPDATE", "Admin update customer"),
            p("ADMIN_CUSTOMER_DELETE", "Admin delete customer"));

    // ── product-service ───────────────────────────────────────────────────────

    static final List<Permission> PRODUCT_PERMISSIONS = List.of(
            p("PRODUCT_LIST", "List products with filter/pagination"),
            p("PRODUCT_DETAIL", "Get product detail by ID"),
            p("PRODUCT_CREATE", "Create a product"),
            p("PRODUCT_UPDATE", "Update a product"),
            p("PRODUCT_DELETE", "Delete a product"),
            p("PRODUCT_COUNT", "Count total products"),
            p("PRODUCT_DETAIL_GET", "Get product detail entity"),
            p("PRODUCT_DETAIL_UPDATE", "Update product detail entity"));

    // ── order-service ─────────────────────────────────────────────────────────

    static final List<Permission> ORDER_PERMISSIONS = List.of(
            p("CART_VIEW", "View own cart"),
            p("CART_UPDATE", "Add or update cart items"),
            p("CART_DELETE_ITEM", "Remove a cart item"),
            p("CART_CLEAR", "Clear own cart"),
            p("ORDER_CHECKOUT", "Create order from cart"),
            p("ORDER_CREATE", "Create an order (legacy)"),
            p("ORDER_LIST", "List own orders"),
            p("ORDER_DETAIL", "Get order detail"),
            p("ORDER_CANCEL", "Cancel own order"),
            p("ORDER_UPDATE_STATUS", "Update order status"),
            p("ORDER_DELETE", "Delete an order"),
            p("ORDER_STATS", "Admin order statistics"),
            p("VOUCHER_LIST", "List vouchers"),
            p("VOUCHER_CREATE", "Create a voucher"),
            p("VOUCHER_UPDATE", "Update a voucher"),
            p("VOUCHER_DELETE", "Delete a voucher"),
            p("VOUCHER_APPLY", "Apply voucher to order"),
            p("VOUCHER_UNAPPLY", "Remove voucher from order"),
            p("PAYMENT_CREATE", "Create a payment"),
            p("PAYMENT_CALLBACK", "Payment provider callback"),
            p("PAYMENT_STATUS", "Check payment status"));

    // ── chat-service ──────────────────────────────────────────────────────────

    static final List<Permission> CHAT_PERMISSIONS = List.of(
            p("CONVERSATION_CREATE", "Create a conversation"),
            p("CONVERSATION_LIST", "List own conversations"),
            p("CONVERSATION_SUPPORT_LIST", "List all support conversations"),
            p("CONVERSATION_SUPPORT_CREATE", "Create a support conversation"),
            p("CONVERSATION_CLAIM", "Claim a support conversation"),
            p("CONVERSATION_TRANSFER", "Transfer a conversation to another manager"),
            p("CONVERSATION_MANAGER_LIST", "List managers available for transfer"),
            p("CONVERSATION_ONLINE_USERS", "Get online user IDs"),
            p("CONVERSATION_USER_ONLINE", "Check if a user is online"),
            p("MESSAGE_SEND", "Send a chat message"),
            p("MESSAGE_LIST", "List messages in a conversation"),
            p("MESSAGE_MARK_READ", "Mark messages as read"),
            p("AI_CHAT", "Send message to AI assistant"),
            p("AI_HISTORY", "Get AI chat history"),
            p("AI_CLEAR", "Clear AI chat history"));

    // ── file-service ──────────────────────────────────────────────────────────

    static final List<Permission> FILE_PERMISSIONS = List.of(p("FILE_UPLOAD", "Upload a file or image to S3"));

    // ── notification-service ──────────────────────────────────────────────────

    static final List<Permission> NOTIFICATION_PERMISSIONS = List.of(p("EMAIL_SEND", "Send an email notification"));

    // ── role → permission mapping ─────────────────────────────────────────────

    static final Set<String> USER_ROLE_PERMISSIONS = Set.of(
            "MY_INFO",
            "CUSTOMER_DETAIL",
            "CUSTOMER_UPDATE",
            "PRODUCT_LIST",
            "PRODUCT_DETAIL",
            "PRODUCT_DETAIL_GET",
            "CART_VIEW",
            "CART_UPDATE",
            "CART_DELETE_ITEM",
            "CART_CLEAR",
            "ORDER_CHECKOUT",
            "ORDER_CREATE",
            "ORDER_LIST",
            "ORDER_DETAIL",
            "ORDER_CANCEL",
            "VOUCHER_LIST",
            "VOUCHER_APPLY",
            "VOUCHER_UNAPPLY",
            "PAYMENT_CREATE",
            "PAYMENT_CALLBACK",
            "PAYMENT_STATUS",
            "CONVERSATION_SUPPORT_CREATE",
            "CONVERSATION_LIST",
            "MESSAGE_SEND",
            "MESSAGE_LIST",
            "MESSAGE_MARK_READ",
            "AI_CHAT",
            "AI_HISTORY",
            "AI_CLEAR",
            "FILE_UPLOAD",
            "CONVERSATION_USER_ONLINE");

    static final Set<String> MANAGER_ROLE_PERMISSIONS = Set.of(
            "MY_INFO",
            "PRODUCT_LIST",
            "PRODUCT_DETAIL",
            "PRODUCT_DETAIL_GET",
            "PRODUCT_CREATE",
            "PRODUCT_UPDATE",
            "PRODUCT_DELETE",
            "ORDER_LIST",
            "ORDER_DETAIL",
            "ORDER_UPDATE_STATUS",
            "ORDER_DELETE",
            "VOUCHER_LIST",
            "VOUCHER_CREATE",
            "VOUCHER_UPDATE",
            "VOUCHER_DELETE",
            "CONVERSATION_LIST",
            "CONVERSATION_SUPPORT_LIST",
            "CONVERSATION_CLAIM",
            "CONVERSATION_TRANSFER",
            "CONVERSATION_MANAGER_LIST",
            "CONVERSATION_ONLINE_USERS",
            "CONVERSATION_USER_ONLINE",
            "MESSAGE_SEND",
            "MESSAGE_LIST",
            "MESSAGE_MARK_READ",
            "AI_CHAT",
            "AI_HISTORY",
            "AI_CLEAR",
            "FILE_UPLOAD",
            "INTERNAL_MANAGER_LIST",
            "INTERNAL_MANAGER_DETAILS");

    // ADMIN gets everything — built dynamically from all lists

    // ─────────────────────────────────────────────────────────────────────────

    @Bean
    @Order(2)
    ApplicationRunner permissionRunner(PermissionRepository permissionRepository, RoleRepository roleRepository) {
        return args -> {
            log.info("Initializing permissions and role assignments.....");

            List<Permission> allPermissions = concat(
                    IDENTITY_PERMISSIONS,
                    USER_PERMISSIONS,
                    PRODUCT_PERMISSIONS,
                    ORDER_PERMISSIONS,
                    CHAT_PERMISSIONS,
                    FILE_PERMISSIONS,
                    NOTIFICATION_PERMISSIONS);
            permissionRepository.saveAll(allPermissions);
            log.info("Saved {} permissions", allPermissions.size());

            // MANAGER role (USER and ADMIN are created by ApplicationInitConfig)
            if (!roleRepository.existsById(PredefinedRole.MANAGER_ROLE)) {
                roleRepository.save(Role.builder()
                        .name(PredefinedRole.MANAGER_ROLE)
                        .description("Manager role")
                        .build());
            }

            // Assign permissions to each role
            assignPermissions(roleRepository, permissionRepository, PredefinedRole.USER_ROLE, USER_ROLE_PERMISSIONS);

            assignPermissions(
                    roleRepository, permissionRepository, PredefinedRole.MANAGER_ROLE, MANAGER_ROLE_PERMISSIONS);

            // ADMIN gets all permissions
            Set<String> allNames = new HashSet<>();
            allPermissions.forEach(perm -> allNames.add(perm.getName()));
            assignPermissions(roleRepository, permissionRepository, PredefinedRole.ADMIN_ROLE, allNames);

            log.info("Permission initialization completed .....");
        };
    }

    private void assignPermissions(
            RoleRepository roleRepository,
            PermissionRepository permissionRepository,
            String roleName,
            Set<String> permissionNames) {
        Optional<Role> optRole = roleRepository.findById(roleName);
        if (optRole.isEmpty()) {
            log.warn("Role '{}' not found, skipping permission assignment", roleName);
            return;
        }
        Role role = optRole.get();
        Set<Permission> perms = new HashSet<>(permissionRepository.findAllById(permissionNames));
        role.setPermissions(perms);
        roleRepository.save(role);
        log.info("Assigned {} permissions to role '{}'", perms.size(), roleName);
    }

    @SafeVarargs
    private static List<Permission> concat(List<Permission>... lists) {
        return java.util.Arrays.stream(lists).flatMap(List::stream).toList();
    }

    private static Permission p(String name, String description) {
        return Permission.builder().name(name).description(description).build();
    }
}
