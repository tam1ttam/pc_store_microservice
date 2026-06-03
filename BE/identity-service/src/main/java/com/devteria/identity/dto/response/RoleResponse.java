package com.devteria.identity.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

/**
 * Role response dùng cho user-facing API (không kèm danh sách permission).
 * Admin dùng endpoint /permissions riêng để quản lý.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoleResponse {
    String name;
    String description;
}
