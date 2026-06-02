package com.devteria.identity.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.devteria.identity.constant.PredefinedRole;
import com.devteria.identity.dto.request.ApiResponse;
import com.devteria.identity.dto.response.ManagerInfoDto;
import com.devteria.identity.repository.UserRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("/internal")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class InternalController {
    UserRepository userRepository;

    @GetMapping("/managers")
    ApiResponse<List<String>> getManagerIds() {
        List<String> managerIds = userRepository.findAllByRoleName(PredefinedRole.MANAGER_ROLE).stream()
                .map(user -> user.getId())
                .toList();
        return ApiResponse.<List<String>>builder().result(managerIds).build();
    }

    @GetMapping("/managers/details")
    ApiResponse<List<ManagerInfoDto>> getManagerDetails() {
        List<ManagerInfoDto> managers = userRepository.findAllByRoleName(PredefinedRole.MANAGER_ROLE).stream()
                .map(user -> ManagerInfoDto.builder()
                        .id(user.getId())
                        .username(user.getUsername())
                        .build())
                .toList();
        return ApiResponse.<List<ManagerInfoDto>>builder().result(managers).build();
    }
}
