package com.tam.profile.controller;

import jakarta.validation.Valid;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.tam.profile.dto.request.AvatarUpdateRequest;
import com.tam.profile.dto.request.ProfileCompletionRequest;
import com.tam.profile.dto.request.ProfileCreationRequest;
import com.tam.profile.dto.request.ProfileUpdateRequest;
import com.tam.profile.dto.response.ApiResponse;
import com.tam.profile.dto.response.ProfileResponse;
import com.tam.profile.service.ProfileService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ProfileController {
    ProfileService profileService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<ProfileResponse>> register(@Valid @RequestBody ProfileCreationRequest request) {
        log.info("Registering new profile: {}", request.getUserName());

        ProfileResponse response = profileService.createProfile(request);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.<ProfileResponse>builder()
                        .code(1000)
                        .message("Đăng ký thành công")
                        .result(response)
                        .build());
    }

    @GetMapping("/{userName}")
    public ResponseEntity<ApiResponse<ProfileResponse>> getProfile(@PathVariable String userName) {
        log.info("Getting profile by userName: {}", userName);

        ProfileResponse response = profileService.getProfileByUserName(userName);

        return ResponseEntity.ok(ApiResponse.<ProfileResponse>builder()
                .code(1000)
                .message("Lấy thông tin thành công")
                .result(response)
                .build());
    }

    @GetMapping("/info")
    public ResponseEntity<ApiResponse<ProfileResponse>> getInfo() {
        log.info("Getting current user info");

        ProfileResponse response = profileService.getInfo();

        return ResponseEntity.ok(ApiResponse.<ProfileResponse>builder()
                .code(1000)
                .message("Lấy thông tin thành công")
                .result(response)
                .build());
    }

    @PutMapping("/complete-profile")
    public ResponseEntity<ApiResponse<ProfileResponse>> completeProfile(
            @Valid @RequestBody ProfileCompletionRequest request) {
        log.info("Completing profile for current user");
        ProfileResponse response = profileService.completeProfile(request);
        return ResponseEntity.ok(ApiResponse.<ProfileResponse>builder()
                .code(1000)
                .message("Hoàn thiện hồ sơ thành công")
                .result(response)
                .build());
    }

    @PutMapping("/{userName}")
    public ResponseEntity<ApiResponse<ProfileResponse>> updateProfile(
            @PathVariable String userName, @RequestBody ProfileUpdateRequest request) {
        log.info("Updating profile: {}", userName);
        ProfileResponse response = profileService.updateProfile(userName, request);
        return ResponseEntity.ok(ApiResponse.<ProfileResponse>builder()
                .code(1000)
                .message("Cập nhật thành công")
                .result(response)
                .build());
    }

    @PutMapping("/avatar")
    public ResponseEntity<ApiResponse<ProfileResponse>> updateAvatar(@RequestBody AvatarUpdateRequest request) {
        log.info("Updating avatar for current user");
        ProfileResponse response = profileService.updateAvatar(request.getAvatar());
        return ResponseEntity.ok(ApiResponse.<ProfileResponse>builder()
                .code(1000)
                .message("Cập nhật ảnh đại diện thành công")
                .result(response)
                .build());
    }
}
