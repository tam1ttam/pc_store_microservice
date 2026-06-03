package com.devteria.notification.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.devteria.notification.dto.ApiResponse;
import com.devteria.notification.dto.response.NotificationResponse;
import com.devteria.notification.service.NotificationService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
@Slf4j
public class NotificationRestController {

    private final NotificationService notificationService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getNotifications(
            @RequestParam(defaultValue = "false") boolean unreadOnly) {
        String userId = currentUserId();
        List<NotificationResponse> list = notificationService.getByUserId(userId, unreadOnly);
        return ResponseEntity.ok(ApiResponse.<List<NotificationResponse>>builder()
                .code(1000)
                .message("OK")
                .result(list)
                .build());
    }

    @GetMapping("/count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount() {
        long count = notificationService.countUnread(currentUserId());
        return ResponseEntity.ok(ApiResponse.<Long>builder()
                .code(1000)
                .message("OK")
                .result(count)
                .build());
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<ApiResponse<NotificationResponse>> markAsRead(@PathVariable String id) {
        NotificationResponse resp = notificationService.markAsRead(id, currentUserId());
        return ResponseEntity.ok(ApiResponse.<NotificationResponse>builder()
                .code(1000)
                .message("Đã đánh dấu đọc")
                .result(resp)
                .build());
    }

    @PutMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead() {
        notificationService.markAllAsRead(currentUserId());
        return ResponseEntity.ok(
                ApiResponse.<Void>builder().code(1000).message("Đã đọc tất cả").build());
    }

    @PutMapping("/{id}/action-done")
    public ResponseEntity<ApiResponse<NotificationResponse>> markActionDone(@PathVariable String id) {
        NotificationResponse resp = notificationService.markActionDone(id, currentUserId());
        return ResponseEntity.ok(ApiResponse.<NotificationResponse>builder()
                .code(1000)
                .message("Đã hoàn thành")
                .result(resp)
                .build());
    }

    private String currentUserId() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }
}
