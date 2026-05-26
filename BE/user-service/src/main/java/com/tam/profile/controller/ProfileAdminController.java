package com.tam.profile.controller;

import jakarta.validation.Valid;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.tam.profile.dto.request.ProfileUpdateRequest;
import com.tam.profile.dto.response.ApiResponse;
import com.tam.profile.dto.response.ProfileResponse;
import com.tam.profile.service.ProfileService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/admin/customers")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class ProfileAdminController {
    ProfileService profileService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<Page<ProfileResponse>>> getAllProfiles(Pageable pageable) {
        log.info("Admin: Getting all profiles with pagination");

        Page<ProfileResponse> response = profileService.getAllProfiles(pageable);

        return ResponseEntity.ok(ApiResponse.<Page<ProfileResponse>>builder()
                .code(1000)
                .message("Lấy danh sách thành công")
                .result(response)
                .build());
    }

    @GetMapping("/search")
    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public ResponseEntity<ApiResponse<Page<ProfileResponse>>> searchProfiles(
            @RequestParam String searchKey, Pageable pageable) {
        log.info("Admin: Searching profiles with key: {}", searchKey);

        Page<ProfileResponse> response = profileService.searchProfilesByName(searchKey, pageable);

        return ResponseEntity.ok(ApiResponse.<Page<ProfileResponse>>builder()
                .code(1000)
                .message("Tìm kiếm thành công")
                .result(response)
                .build());
    }

    @PutMapping("/{userName}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ProfileResponse>> updateProfile(
            @PathVariable String userName, @Valid @RequestBody ProfileUpdateRequest request) {
        log.info("Admin: Updating profile: {}", userName);

        ProfileResponse response = profileService.updateProfile(userName, request);

        return ResponseEntity.ok(ApiResponse.<ProfileResponse>builder()
                .code(1000)
                .message("Cập nhật thành công")
                .result(response)
                .build());
    }

    @DeleteMapping("/{userName}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> deleteProfile(@PathVariable String userName) {
        log.info("Admin: Deleting profile: {}", userName);

        profileService.deleteProfile(userName);

        return ResponseEntity.ok(ApiResponse.<String>builder()
                .code(1000)
                .message("Xóa thành công")
                .result("Người dùng đã bị xóa: " + userName)
                .build());
    }

    @GetMapping("/count")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Long>> countProfiles() {
        return ResponseEntity.ok(ApiResponse.<Long>builder()
                .code(1000)
                .message("Lấy số lượng thành công")
                .result(profileService.countProfiles())
                .build());
    }
}
