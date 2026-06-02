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
            p("PERMISSION_LIST", "permission", "GET /identity-service/permissions", "List all permissions"),
            p("PERMISSION_CREATE", "permission", "POST /identity-service/permissions", "Create a permission"),
            p(
                    "PERMISSION_DELETE",
                    "permission",
                    "DELETE /identity-service/permissions/{name}",
                    "Delete a permission by name"),
            p("USER_LIST", "user", "GET /identity-service/users", "List all users"),
            p("USER_CREATE", "user", "POST /identity-service/users", "Create a user"),
            p("USER_UPDATE", "user", "PUT /identity-service/users/{userId}", "Update a user"),
            p("USER_DELETE", "user", "DELETE /identity-service/users/{userId}", "Delete a user"),
            p("USER_DETAIL", "user", "GET /identity-service/users/{userId}", "Get user detail"),
            p("MY_INFO", "user", "GET /identity-service/users/my-info", "Get my own info"),
            p("ROLE_LIST", "role", "GET /identity-service/roles", "List all roles"),
            p("ROLE_CREATE", "role", "POST /identity-service/roles", "Create a role"),
            p("ROLE_DELETE", "role", "DELETE /identity-service/roles/{role}", "Delete a role"),
            p(
                    "ADMIN_UPDATE_ROLE",
                    "admin",
                    "POST /identity-service/api/admin/update-role/{userName}",
                    "Admin grant ADMIN role to user"),
            p("ADMIN_ROLE_LIST", "admin", "GET /identity-service/api/admin/roles", "Admin list all roles"),
            p("ADMIN_HISTORY", "admin", "GET /identity-service/api/admin/history", "Admin view action history"),
            p(
                    "INTERNAL_MANAGER_LIST",
                    "internal",
                    "GET /identity-service/internal/managers",
                    "Internal list of managers"),
            p(
                    "INTERNAL_MANAGER_DETAILS",
                    "internal",
                    "GET /identity-service/internal/managers/details",
                    "Internal manager details with username"));

    // ── user-service ──────────────────────────────────────────────────────────

    static final List<Permission> USER_PERMISSIONS = List.of(
            p("CUSTOMER_REGISTER", "customer", "POST /api/customers", "Register a new customer profile"),
            p("CUSTOMER_DETAIL", "customer", "GET /api/customers/my-profile", "Get own customer profile"),
            p("CUSTOMER_UPDATE", "customer", "PUT /api/customers/{id}", "Update own customer profile"),
            p(
                    "CUSTOMER_COMPLETE_PROFILE",
                    "customer",
                    "PUT /api/customers/complete-profile",
                    "Complete customer profile (activate account)"),
            p("CUSTOMER_AVATAR_UPDATE", "customer", "PUT /api/customers/avatar", "Update customer avatar"),
            p("ADMIN_USER_INFO", "user", "GET /api/customers/info", "Admin get own info"),
            p("ADMIN_CUSTOMER_LIST", "customer", "GET /api/admin/customers", "Admin list all customers"),
            p("ADMIN_CUSTOMER_SEARCH", "customer", "GET /api/admin/customers/search", "Admin search customers"),
            p("ADMIN_CUSTOMER_COUNT", "customer", "GET /api/admin/customers/count", "Admin count customers"),
            p("ADMIN_CUSTOMER_DETAIL", "customer", "GET /api/admin/customers/{userName}", "Admin get customer detail"),
            p("ADMIN_CUSTOMER_UPDATE", "customer", "PUT /api/admin/customers/{userName}", "Admin update customer"),
            p("ADMIN_CUSTOMER_DELETE", "customer", "DELETE /api/admin/customers/{userName}", "Admin delete customer"));

    // ── product-service ───────────────────────────────────────────────────────

    static final List<Permission> PRODUCT_PERMISSIONS = List.of(
            p("PRODUCT_LIST", "product", "GET /products", "List products with filter/pagination"),
            p("PRODUCT_DETAIL", "product", "GET /products/{id}", "Get product detail by ID"),
            p("PRODUCT_CREATE", "product", "POST /products", "Create a product"),
            p("PRODUCT_UPDATE", "product", "PUT /products/{id}", "Update a product"),
            p("PRODUCT_DELETE", "product", "DELETE /products/{id}", "Delete a product"),
            p("PRODUCT_COUNT", "product", "GET /products/count", "Count total products"),
            p(
                    "PRODUCT_BY_CATEGORIES",
                    "product",
                    "GET /products/by-categories",
                    "List products filtered by multiple categories"),
            p("PRODUCT_CATEGORY_COUNTS", "product", "GET /products/category-counts", "Count products per category"),
            p("PRODUCT_DETAIL_GET", "product", "GET /product-details/{id}", "Get product detail entity"),
            p("PRODUCT_DETAIL_UPDATE", "product", "PUT /product-details/{id}", "Update product detail entity"),
            p("PRODUCT_ANALYTICS", "product", "GET /products/analytics", "Product analytics stats"),
            p("PRODUCT_REVIEW_CREATE", "review", "POST /reviews", "Submit product review"),
            p("PRODUCT_REVIEW_UPDATE", "review", "PUT /reviews/{id}", "Update own review"),
            p("PRODUCT_REVIEW_DELETE", "review", "DELETE /reviews/{id}", "Delete a review (admin)"),
            p("PRODUCT_REVIEW_READ", "review", "GET /reviews/product/{productId}", "List reviews for product"),
            p("CATEGORY_LIST", "category", "GET /categories", "List product categories"),
            p("CATEGORY_CREATE", "category", "POST /categories", "Create a product category"),
            p("CATEGORY_DELETE", "category", "DELETE /categories/{name}", "Delete a product category"));

    // ── order-service ─────────────────────────────────────────────────────────

    static final List<Permission> ORDER_PERMISSIONS = List.of(
            p("CART_VIEW", "cart", "GET /order-service/cart", "View own cart"),
            p("CART_UPDATE", "cart", "PUT /order-service/cart/items", "Add or update cart items"),
            p("CART_DELETE_ITEM", "cart", "DELETE /order-service/cart/items/{id}", "Remove a cart item"),
            p("CART_CLEAR", "cart", "DELETE /order-service/cart/clear", "Clear own cart"),
            p("ORDER_CHECKOUT", "order", "POST /order-service/api/orders/checkout", "Create order from cart"),
            p("ORDER_CREATE", "order", "POST /order-service/api/orders", "Create an order (legacy)"),
            p("ORDER_LIST", "order", "GET /order-service/api/orders", "List own orders"),
            p("ORDER_LIST_ALL", "order", "GET /order-service/api/orders/all", "List all orders"),
            p("ORDER_LIST_ADMIN", "order", "GET /order-service/api/orders/admin/all", "List all orders for admin"),
            p("ORDER_DETAIL", "order", "GET /order-service/api/orders/{id}", "Get order detail"),
            p("ORDER_CANCEL", "order", "PATCH /order-service/api/orders/{id}/cancel", "Cancel own order"),
            p(
                    "ORDER_UPDATE_STATUS",
                    "order",
                    "PATCH /order-service/api/orders/{id}/status",
                    "Update order status (manager)"),
            p("ORDER_DELETE", "order", "DELETE /order-service/manager/orders/{id}", "Delete an order (manager)"),
            p("ORDER_STATS", "order", "GET /order-service/api/orders/stats", "Admin order statistics"),
            p("VOUCHER_LIST", "voucher", "GET /order-service/vouchers", "List available vouchers"),
            p("VOUCHER_CREATE", "voucher", "POST /order-service/manager/vouchers", "Create a voucher"),
            p("VOUCHER_UPDATE", "voucher", "PUT /order-service/manager/vouchers/{id}", "Update a voucher"),
            p("VOUCHER_DELETE", "voucher", "DELETE /order-service/manager/vouchers/{id}", "Delete a voucher"),
            p("VOUCHER_APPLY", "voucher", "POST /order-service/vouchers/apply", "Apply voucher to order"),
            p("VOUCHER_UNAPPLY", "voucher", "DELETE /order-service/vouchers/unapply", "Remove voucher from order"),
            p("PAYMENT_CREATE", "payment", "POST /order-service/payments", "Create a payment"),
            p("PAYMENT_CALLBACK", "payment", "GET /order-service/payments/callback", "Payment provider callback"),
            p("PAYMENT_STATUS", "payment", "GET /order-service/payments/status", "Check payment status"));

    // ── chat-service ──────────────────────────────────────────────────────────

    static final List<Permission> CHAT_PERMISSIONS = List.of(
            p("CONVERSATION_CREATE", "conversation", "POST /conversations", "Create a direct conversation"),
            p("CONVERSATION_LIST", "conversation", "GET /conversations/my", "List own conversations"),
            p(
                    "CONVERSATION_SUPPORT_LIST",
                    "conversation",
                    "GET /conversations/support",
                    "List all support conversations"),
            p(
                    "CONVERSATION_SUPPORT_CREATE",
                    "conversation",
                    "POST /conversations/support",
                    "Create a support conversation"),
            p("CONVERSATION_CLAIM", "conversation", "PATCH /conversations/{id}/claim", "Claim a support conversation"),
            p(
                    "CONVERSATION_TRANSFER",
                    "conversation",
                    "PATCH /conversations/{id}/transfer",
                    "Transfer a conversation to another manager"),
            p(
                    "CONVERSATION_MANAGER_LIST",
                    "conversation",
                    "GET /conversations/managers",
                    "List managers available for transfer"),
            p("CONVERSATION_ONLINE_USERS", "conversation", "GET /conversations/online-users", "Get online user IDs"),
            p(
                    "CONVERSATION_MANAGER_ONLINE",
                    "conversation",
                    "GET /conversations/managers/online",
                    "Get online manager IDs"),
            p(
                    "CONVERSATION_USER_ONLINE",
                    "conversation",
                    "GET /conversations/users/{userId}/online",
                    "Check if a specific user is online"),
            p("MESSAGE_SEND", "message", "POST /messages", "Send a chat message"),
            p("MESSAGE_LIST", "message", "GET /messages", "List messages in a conversation"),
            p("MESSAGE_MARK_READ", "message", "POST /messages/read", "Mark messages as read"),
            p("AI_CHAT", "ai", "POST /ai-service/ai/chat", "Send message to AI assistant"),
            p("AI_HISTORY", "ai", "GET /ai-service/ai/history", "Get AI chat history"),
            p("AI_CLEAR", "ai", "DELETE /ai-service/ai/history", "Clear AI chat history"));

    // ── file-service ──────────────────────────────────────────────────────────

    static final List<Permission> FILE_PERMISSIONS =
            List.of(p("FILE_UPLOAD", "file", "POST /media/upload", "Upload a file or image to S3"));

    // ── notification-service ──────────────────────────────────────────────────

    static final List<Permission> NOTIFICATION_PERMISSIONS = List.of(
            p("EMAIL_SEND", "notification", "POST /api/notifications/email", "Send an email notification"),
            p("NOTIFICATION_LIST", "notification", "GET /api/notifications", "List own notifications"),
            p(
                    "NOTIFICATION_MARK_READ",
                    "notification",
                    "PUT /api/notifications/{id}/read",
                    "Mark a notification as read"),
            p(
                    "NOTIFICATION_MARK_ALL_READ",
                    "notification",
                    "PUT /api/notifications/read-all",
                    "Mark all notifications as read"),
            p(
                    "NOTIFICATION_ACTION_DONE",
                    "notification",
                    "PUT /api/notifications/{id}/action-done",
                    "Mark notification action as done"),
            p("NOTIFICATION_COUNT", "notification", "GET /api/notifications/count", "Get notification count"));

    // ── role → permission mapping ─────────────────────────────────────────────

    static final Set<String> USER_ROLE_PERMISSIONS = Set.of(
            "MY_INFO",
            "CUSTOMER_DETAIL",
            "CUSTOMER_UPDATE",
            "CUSTOMER_COMPLETE_PROFILE",
            "CUSTOMER_AVATAR_UPDATE",
            "PRODUCT_LIST",
            "PRODUCT_DETAIL",
            "PRODUCT_DETAIL_GET",
            "PRODUCT_BY_CATEGORIES",
            "PRODUCT_CATEGORY_COUNTS",
            "PRODUCT_REVIEW_CREATE",
            "PRODUCT_REVIEW_UPDATE",
            "PRODUCT_REVIEW_READ",
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
            "CONVERSATION_USER_ONLINE",
            "CATEGORY_LIST",
            "NOTIFICATION_LIST",
            "NOTIFICATION_MARK_READ",
            "NOTIFICATION_MARK_ALL_READ",
            "NOTIFICATION_ACTION_DONE",
            "NOTIFICATION_COUNT");

    static final Set<String> MANAGER_ROLE_PERMISSIONS = Set.of(
            "MY_INFO",
            "PRODUCT_LIST",
            "PRODUCT_DETAIL",
            "PRODUCT_DETAIL_GET",
            "PRODUCT_DETAIL_UPDATE",
            "PRODUCT_CREATE",
            "PRODUCT_UPDATE",
            "PRODUCT_DELETE",
            "PRODUCT_COUNT",
            "PRODUCT_BY_CATEGORIES",
            "PRODUCT_CATEGORY_COUNTS",
            "PRODUCT_ANALYTICS",
            "PRODUCT_REVIEW_CREATE",
            "PRODUCT_REVIEW_UPDATE",
            "PRODUCT_REVIEW_DELETE",
            "PRODUCT_REVIEW_READ",
            "ORDER_LIST",
            "ORDER_DETAIL",
            "ORDER_UPDATE_STATUS",
            "ORDER_DELETE",
            "ORDER_STATS",
            "VOUCHER_LIST",
            "VOUCHER_CREATE",
            "VOUCHER_UPDATE",
            "VOUCHER_DELETE",
            "ADMIN_CUSTOMER_LIST",
            "ADMIN_CUSTOMER_SEARCH",
            "ADMIN_CUSTOMER_COUNT",
            "CONVERSATION_CREATE",
            "CONVERSATION_LIST",
            "CONVERSATION_SUPPORT_LIST",
            "CONVERSATION_CLAIM",
            "CONVERSATION_TRANSFER",
            "CONVERSATION_MANAGER_LIST",
            "CONVERSATION_MANAGER_ONLINE",
            "CONVERSATION_ONLINE_USERS",
            "CONVERSATION_USER_ONLINE",
            "MESSAGE_SEND",
            "MESSAGE_LIST",
            "MESSAGE_MARK_READ",
            "AI_CHAT",
            "AI_HISTORY",
            "AI_CLEAR",
            "AI_STATS",
            "CHAT_ANALYTICS_TOP",
            "FILE_UPLOAD",
            "INTERNAL_MANAGER_LIST",
            "INTERNAL_MANAGER_DETAILS",
            "CATEGORY_LIST",
            "CATEGORY_CREATE",
            "CATEGORY_DELETE",
            "NOTIFICATION_LIST",
            "NOTIFICATION_MARK_READ",
            "NOTIFICATION_MARK_ALL_READ",
            "NOTIFICATION_ACTION_DONE",
            "NOTIFICATION_COUNT");

    // ADMIN gets everything — built dynamically from all permission lists

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

            // Upsert: create if absent, update url/group/description if present
            int created = 0, updated = 0;
            for (Permission perm : allPermissions) {
                Optional<Permission> existing = permissionRepository.findByName(perm.getName());
                if (existing.isEmpty()) {
                    permissionRepository.save(perm);
                    created++;
                } else {
                    Permission e = existing.get();
                    e.setGroup(perm.getGroup());
                    e.setUrl(perm.getUrl());
                    e.setDescription(perm.getDescription());
                    permissionRepository.save(e);
                    updated++;
                }
            }
            log.info("Permissions — created: {}, updated: {}", created, updated);

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
        Set<Permission> perms = new HashSet<>(permissionRepository.findAllByNameIn(permissionNames));
        role.setPermissions(perms);
        roleRepository.save(role);
        log.info("Assigned {} permissions to role '{}'", perms.size(), roleName);
    }

    @SafeVarargs
    private static List<Permission> concat(List<Permission>... lists) {
        return java.util.Arrays.stream(lists).flatMap(List::stream).toList();
    }

    private static Permission p(String name, String group, String url, String description) {
        return Permission.builder()
                .name(name)
                .group(group)
                .url(url)
                .description(description)
                .build();
    }
}
