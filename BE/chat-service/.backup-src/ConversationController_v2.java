package com.tam.chat.controller;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.*;

import com.tam.chat.dto.ApiResponse;
import com.tam.chat.dto.request.ConversationRequest;
import com.tam.chat.dto.request.TransferRequest;
import com.tam.chat.dto.response.ConversationResponse;
import com.tam.chat.dto.response.ManagerInfoResponse;
import com.tam.chat.service.ConversationService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequiredArgsConstructor
@RequestMapping("conversations")
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ConversationController {
    ConversationService conversationService;

    @PostMapping("/create")
    ApiResponse<ConversationResponse> createConversation(@RequestBody @Valid ConversationRequest request) {
        return ApiResponse.<ConversationResponse>builder()
                .result(conversationService.create(request))
                .build();
    }

    @GetMapping("/my-conversations")
    ApiResponse<List<ConversationResponse>> myConversations() {
        return ApiResponse.<List<ConversationResponse>>builder()
                .result(conversationService.myConversations())
                .build();
    }

    @PostMapping("/with-store")
    ApiResponse<ConversationResponse> withStore() {
        return ApiResponse.<ConversationResponse>builder()
                .result(conversationService.getOrCreateStoreChat())
                .build();
    }

    @GetMapping("/support-all")
    ApiResponse<List<ConversationResponse>> supportAll() {
        return ApiResponse.<List<ConversationResponse>>builder()
                .result(conversationService.getAllSupportConversations())
                .build();
    }

    @PostMapping("/{id}/claim")
    ApiResponse<ConversationResponse> claim(@PathVariable String id) {
        return ApiResponse.<ConversationResponse>builder()
                .result(conversationService.claimConversation(id))
                .build();
    }

    @PostMapping("/{id}/transfer")
    ApiResponse<ConversationResponse> transfer(@PathVariable String id, @RequestBody @Valid TransferRequest request) {
        return ApiResponse.<ConversationResponse>builder()
                .result(conversationService.transferConversation(id, request.getToManagerId()))
                .build();
    }

    @GetMapping("/managers")
    ApiResponse<List<ManagerInfoResponse>> getManagers() {
        return ApiResponse.<List<ManagerInfoResponse>>builder()
                .result(conversationService.getManagerList())
                .build();
    }

    @GetMapping("/managers/online")
    ApiResponse<List<String>> getOnlineManagers() {
        return ApiResponse.<List<String>>builder()
                .result(conversationService.getOnlineManagerIds())
                .build();
    }

    @GetMapping("/users/{userId}/online")
    ApiResponse<Boolean> isUserOnline(@PathVariable String userId) {
        return ApiResponse.<Boolean>builder()
                .result(conversationService.isUserOnline(userId))
                .build();
    }
}
