package com.devteria.identity.controller;

import java.util.List;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.devteria.identity.dto.request.ApiResponse;
import com.devteria.identity.entity.HistoryAction;
import com.devteria.identity.service.AdminService;
import com.devteria.identity.service.UserService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class AdminController {
    UserService userService;
    AdminService adminService;

    @PostMapping("/update-role/{userName}")
    @PreAuthorize("hasRole('ADMIN')")
    ApiResponse<Void> updateRoleForUser(@PathVariable String userName) {
        log.info("Update role for user: {}", userName);
        userService.assignRoleToUser(userName, "ADMIN");
        adminService.createHistory(
                "Update Role", "Role ADMIN has been assigned to user " + userName, "SUCCESS", null, "");

        return ApiResponse.<Void>builder().build();
    }

    @GetMapping("/history")
    @PreAuthorize("hasRole('ADMIN')")
    ApiResponse<List<HistoryAction>> getHistory() {
        return ApiResponse.<List<HistoryAction>>builder()
                .result(adminService.getAllHistory())
                .build();
    }
}
