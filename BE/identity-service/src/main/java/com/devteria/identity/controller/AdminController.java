package com.devteria.identity.controller;

import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.devteria.identity.dto.request.ApiResponse;
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

    @PostMapping("/update-role/{userName}")
    ApiResponse<Void> updateRoleForUser(@PathVariable String userName) {
        log.info("Update role for user: {}", userName);
        userService.assignRoleToUser(userName, "ADMIN");
        return ApiResponse.<Void>builder().build();
    }
}
