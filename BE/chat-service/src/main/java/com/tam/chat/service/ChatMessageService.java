package com.tam.chat.service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.corundumstudio.socketio.SocketIOServer;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tam.chat.dto.request.ChatMessageRequest;
import com.tam.chat.dto.response.ChatMessageResponse;
import com.tam.chat.dto.response.ConversationResponse;
import com.tam.chat.entity.ChatMessage;
import com.tam.chat.entity.Conversation;
import com.tam.chat.entity.ParticipantInfo;
import com.tam.chat.entity.WebSocketSession;
import com.tam.chat.exception.AppException;
import com.tam.chat.exception.ErrorCode;
import com.tam.chat.mapper.ChatMessageMapper;
import com.tam.chat.mapper.ConversationMapper;
import com.tam.chat.repository.ChatMessageRepository;
import com.tam.chat.repository.ConversationRepository;
import com.tam.chat.repository.WebSocketSessionRepository;
import com.tam.chat.repository.grpc.ProfileGrpcClient;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ChatMessageService {
    SocketIOServer socketIOServer;

    ChatMessageRepository chatMessageRepository;
    ConversationRepository conversationRepository;
    WebSocketSessionRepository webSocketSessionRepository;
    ProfileGrpcClient profileGrpcClient;

    ObjectMapper objectMapper;
    ChatMessageMapper chatMessageMapper;
    ConversationMapper conversationMapper;

    public List<ChatMessageResponse> getMessages(String conversationId) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        var conversation = conversationRepository
                .findById(conversationId)
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));

        if ("SUPPORT".equals(conversation.getType())) {
            boolean isClient = userId.equals(conversation.getClientId());
            boolean isAssignedManager = userId.equals(conversation.getAssignedManagerId());
            if (!isClient && !isAssignedManager) {
                throw new AppException(ErrorCode.CONVERSATION_NOT_FOUND);
            }
        } else {
            boolean isParticipant = conversation.getParticipants().stream().anyMatch(p -> userId.equals(p.getUserId()));
            if (!isParticipant) {
                throw new AppException(ErrorCode.CONVERSATION_NOT_FOUND);
            }
        }

        return chatMessageRepository.findAllByConversationIdOrderByCreatedDateDesc(conversationId).stream()
                .map(this::toChatMessageResponse)
                .toList();
    }

    public ChatMessageResponse create(ChatMessageRequest request) throws JsonProcessingException {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();

        var conversation = conversationRepository
                .findById(request.getConversationId())
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));

        // Validate sender access
        if ("SUPPORT".equals(conversation.getType())) {
            boolean isClient = userId.equals(conversation.getClientId());
            boolean isAssignedManager = userId.equals(conversation.getAssignedManagerId());
            if (!isClient && !isAssignedManager) {
                throw new AppException(ErrorCode.SEND_NOT_ALLOWED);
            }
        } else {
            boolean isParticipant = conversation.getParticipants().stream().anyMatch(p -> userId.equals(p.getUserId()));
            if (!isParticipant) {
                throw new AppException(ErrorCode.CONVERSATION_NOT_FOUND);
            }
        }

        var userInfo = profileGrpcClient.getProfileByUserId(userId);

        // Build sender info; fall back to userId-only if profile not found (e.g. manager accounts)
        ParticipantInfo.ParticipantInfoBuilder senderBuilder =
                ParticipantInfo.builder().userId(userId);
        if (userInfo != null) {
            senderBuilder
                    .username(userInfo.getUsername())
                    .firstName(userInfo.getFirstName())
                    .lastName(userInfo.getLastName())
                    .avatar(userInfo.getAvatar());
        } else {
            // Try to use existing participant info for this user if already stored
            conversation.getParticipants().stream()
                    .filter(p -> userId.equals(p.getUserId()))
                    .findFirst()
                    .ifPresent(p -> {
                        senderBuilder
                                .username(p.getUsername())
                                .firstName(p.getFirstName())
                                .lastName(p.getLastName())
                                .avatar(p.getAvatar());
                    });
        }

        ChatMessage chatMessage = chatMessageMapper.toChatMessage(request);
        chatMessage.setSender(senderBuilder.build());
        chatMessage.setCreatedDate(Instant.now());
        chatMessage = chatMessageRepository.save(chatMessage);

        // Update lastMessage preview on conversation
        conversation.setLastMessage(chatMessage.getMessage());
        conversation.setLastMessageAt(chatMessage.getCreatedDate());
        conversation.setModifiedDate(chatMessage.getCreatedDate());
        conversationRepository.save(conversation);

        // Broadcast message to conversation participants via socket
        // Also include assignedManagerId in case they're not yet in the participants list
        List<String> userIds = new ArrayList<>(conversation.getParticipants().stream()
                .map(ParticipantInfo::getUserId)
                .toList());
        if (conversation.getAssignedManagerId() != null && !userIds.contains(conversation.getAssignedManagerId())) {
            userIds.add(conversation.getAssignedManagerId());
        }

        Map<String, WebSocketSession> webSocketSessions = webSocketSessionRepository.findAllByUserIdIn(userIds).stream()
                .collect(Collectors.toMap(WebSocketSession::getSocketSessionId, Function.identity()));

        log.debug(
                "Broadcasting message: userIds={}, sessions found={}, total clients={}",
                userIds,
                webSocketSessions.size(),
                socketIOServer.getAllClients().size());

        ChatMessageResponse chatMessageResponse = chatMessageMapper.toChatMessageResponse(chatMessage);
        socketIOServer.getAllClients().forEach(client -> {
            var session = webSocketSessions.get(client.getSessionId().toString());
            log.debug(
                    "  client={} -> session={}",
                    client.getSessionId(),
                    session != null ? session.getUserId() : "NO MATCH");
            if (Objects.nonNull(session)) {
                try {
                    chatMessageResponse.setMe(session.getUserId().equals(userId));
                    String message = objectMapper.writeValueAsString(chatMessageResponse);
                    client.sendEvent("message", message);
                    log.debug("  -> sent to userId={}", session.getUserId());
                } catch (JsonProcessingException e) {
                    throw new RuntimeException(e);
                }
            }
        });

        // Also broadcast conversation_updated to all managers so sidebar refreshes
        broadcastConversationUpdate(conversation);

        return toChatMessageResponse(chatMessage);
    }

    private void broadcastConversationUpdate(Conversation conversation) {
        try {
            ConversationResponse response = buildBroadcastResponse(conversation);
            String json = objectMapper.writeValueAsString(response);
            socketIOServer.getAllClients().forEach(c -> c.sendEvent("conversation_updated", json));
        } catch (JsonProcessingException e) {
            log.error("Failed to broadcast conversation update", e);
        }
    }

    private ConversationResponse buildBroadcastResponse(Conversation conversation) {
        ConversationResponse response = conversationMapper.toConversationResponse(conversation);
        if (conversation.getAssignedManagerId() != null) {
            conversation.getParticipants().stream()
                    .filter(p -> conversation.getAssignedManagerId().equals(p.getUserId()))
                    .findFirst()
                    .ifPresent(p -> response.setAssignedManagerName(p.getUsername()));
        }
        if (conversation.getParticipants() != null
                && !conversation.getParticipants().isEmpty()) {
            var first = conversation.getParticipants().get(0);
            response.setConversationName(first.getUsername());
            response.setConversationAvatar(first.getAvatar());
        }
        return response;
    }

    private ChatMessageResponse toChatMessageResponse(ChatMessage chatMessage) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        var response = chatMessageMapper.toChatMessageResponse(chatMessage);
        response.setMe(userId.equals(chatMessage.getSender().getUserId()));
        return response;
    }
}
