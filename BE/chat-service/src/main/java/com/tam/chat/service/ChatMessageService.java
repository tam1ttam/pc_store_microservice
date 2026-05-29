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
import com.tam.chat.dto.response.ManagerInfoResponse;
import com.tam.chat.entity.*;
import com.tam.chat.exception.AppException;
import com.tam.chat.exception.ErrorCode;
import com.tam.chat.mapper.ChatMessageMapper;
import com.tam.chat.mapper.ConversationMapper;
import com.tam.chat.repository.ChatMessageRepository;
import com.tam.chat.repository.ConversationRepository;
import com.tam.chat.repository.WebSocketSessionRepository;
import com.tam.chat.repository.grpc.ProfileGrpcClient;
import com.tam.chat.repository.httpclient.IdentityClient;

import feign.FeignException;
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
    IdentityClient identityClient;

    ObjectMapper objectMapper;
    ChatMessageMapper chatMessageMapper;
    ConversationMapper conversationMapper;

    public List<ChatMessageResponse> getMessages(String conversationId) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        var conversation = conversationRepository
                .findById(conversationId)
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));

        if ("SUPPORT".equals(conversation.getType())) {
            // Client can always read their own conversation.
            // Any manager can read SUPPORT conversations — store conversation is shared.
            boolean isClient = userId.equals(conversation.getClientId());
            if (!isClient) {
                List<String> managerIds = fetchManagerIds();
                // Fail-open: if manager list unavailable, allow access (identity-service may be slow)
                if (!managerIds.isEmpty() && !managerIds.contains(userId)) {
                    throw new AppException(ErrorCode.CONVERSATION_NOT_FOUND);
                }
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

        // Validate: must have message text, a product card, or at least one attachment
        boolean hasText = request.getMessage() != null && !request.getMessage().isBlank();
        boolean hasAttachments =
                request.getAttachments() != null && !request.getAttachments().isEmpty();
        boolean hasProductCard = request.getProductCard() != null;
        if (!hasText && !hasAttachments && !hasProductCard) {
            throw new AppException(ErrorCode.SEND_NOT_ALLOWED);
        }

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

        // Build sender info
        var userInfo = profileGrpcClient.getProfileByUserId(userId);
        ParticipantInfo.ParticipantInfoBuilder senderBuilder =
                ParticipantInfo.builder().userId(userId);
        if (userInfo != null) {
            senderBuilder
                    .username(userInfo.getUsername())
                    .firstName(userInfo.getFirstName())
                    .lastName(userInfo.getLastName())
                    .avatar(userInfo.getAvatar());
        } else {
            // Try participants list first (for DIRECT participants or client in SUPPORT)
            boolean found = conversation.getParticipants().stream()
                    .filter(p -> userId.equals(p.getUserId()))
                    .findFirst()
                    .map(p -> {
                        senderBuilder
                                .username(p.getUsername())
                                .firstName(p.getFirstName())
                                .lastName(p.getLastName())
                                .avatar(p.getAvatar());
                        return true;
                    })
                    .orElse(false);
            if (!found) {
                // Manager not in participants (SUPPORT) — use username cached in WebSocketSession,
                // fall back to identity-service Feign call if session not found
                String cachedUsername = webSocketSessionRepository
                        .findFirstByUserId(userId)
                        .map(WebSocketSession::getUsername)
                        .orElse(null);
                senderBuilder.username(cachedUsername != null ? cachedUsername : fetchManagerUsernameById(userId));
            }
        }

        ChatMessage chatMessage = chatMessageMapper.toChatMessage(request);
        chatMessage.setSender(senderBuilder.build());
        chatMessage.setCreatedDate(Instant.now());
        chatMessage = chatMessageRepository.save(chatMessage);
        final ChatMessage savedMessage = chatMessage;
        // Update lastMessage preview on conversation
        String lastMsgPreview = "";
        if (chatMessage.getMessageType() == MessageType.PRODUCT_CARD && chatMessage.getProductCard() != null) {
            lastMsgPreview = "📦 " + chatMessage.getProductCard().getName();
        } else if (chatMessage.getMessage() != null && !chatMessage.getMessage().isBlank()) {
            lastMsgPreview = chatMessage.getMessage();
        } else if (chatMessage.getAttachments() != null
                && !chatMessage.getAttachments().isEmpty()) {
            lastMsgPreview = "📎 " + chatMessage.getAttachments().get(0).getOriginalFileName();
        }
        conversation.setLastMessage(lastMsgPreview);
        conversation.setLastMessageAt(chatMessage.getCreatedDate());
        conversation.setModifiedDate(chatMessage.getCreatedDate());
        conversationRepository.save(conversation);

        // Determine recipients for socket broadcast
        List<String> userIds;
        if ("SUPPORT".equals(conversation.getType())) {
            // SUPPORT: deliver to client + ALL managers (any manager may be watching)
            userIds = new ArrayList<>();
            userIds.add(conversation.getClientId());
            userIds.addAll(fetchManagerIds());
        } else {
            // DIRECT: deliver to conversation participants only
            userIds = conversation.getParticipants().stream()
                    .map(ParticipantInfo::getUserId)
                    .collect(Collectors.toCollection(ArrayList::new));
        }

        Map<String, WebSocketSession> webSocketSessions = webSocketSessionRepository.findAllByUserIdIn(userIds).stream()
                .collect(Collectors.toMap(WebSocketSession::getSocketSessionId, Function.identity()));

        log.debug(
                "Broadcasting message: userIds={}, sessions found={}, total clients={}",
                userIds,
                webSocketSessions.size(),
                socketIOServer.getAllClients().size());

        socketIOServer.getAllClients().forEach(client -> {
            var session = webSocketSessions.get(client.getSessionId().toString());
            log.debug(
                    "  client={} -> session={}",
                    client.getSessionId(),
                    session != null ? session.getUserId() : "NO MATCH");
            if (Objects.nonNull(session)) {
                try {
                    ChatMessageResponse perRecipient = chatMessageMapper.toChatMessageResponse(savedMessage);
                    perRecipient.setMe(session.getUserId().equals(userId));
                    String message = objectMapper.writeValueAsString(perRecipient);
                    client.sendEvent("message", message);
                    log.debug("  -> sent to userId={}", session.getUserId());
                } catch (JsonProcessingException e) {
                    throw new RuntimeException(e);
                }
            }
        });

        // Broadcast conversation_updated so all managers' sidebars refresh
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
            if ("SUPPORT".equals(conversation.getType())) {
                // Managers not stored in participants for SUPPORT — fetch from identity
                response.setAssignedManagerName(fetchManagerUsernameById(conversation.getAssignedManagerId()));
            } else {
                String name = conversation.getParticipants().stream()
                        .filter(p -> conversation.getAssignedManagerId().equals(p.getUserId()))
                        .map(ParticipantInfo::getUsername)
                        .filter(Objects::nonNull)
                        .findFirst()
                        .orElseGet(() -> fetchManagerUsernameById(conversation.getAssignedManagerId()));
                response.setAssignedManagerName(name);
            }
        }

        // For SUPPORT: participants[0] is always the client
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

    private List<String> fetchManagerIds() {
        try {
            var response = identityClient.getManagerIds();
            if (response != null && response.getResult() != null) {
                return response.getResult();
            }
        } catch (FeignException e) {
            log.warn("Could not fetch manager IDs: {}", e.getMessage());
        }
        return List.of();
    }

    private String fetchManagerUsernameById(String managerId) {
        try {
            var response = identityClient.getManagerDetails();
            if (response != null && response.getResult() != null) {
                return response.getResult().stream()
                        .filter(m -> managerId.equals(m.getId()))
                        .map(ManagerInfoResponse::getUsername)
                        .findFirst()
                        .orElse(null);
            }
        } catch (FeignException e) {
            log.warn("Could not fetch manager username: {}", e.getMessage());
        }
        return null;
    }

    public void saveAiMessage(String userId, String message, String senderId, String senderName) {
        var conversation = conversationRepository.findAll().stream()
                .filter(c -> "AI".equals(c.getType()) && userId.equals(c.getClientId()))
                .findFirst()
                .orElseGet(() -> {
                    Conversation conv = Conversation.builder()
                            .type("AI")
                            .clientId(userId)
                            .participants(List.of(
                                    ParticipantInfo.builder().userId(userId).build()))
                            .build();
                    return conversationRepository.save(conv);
                });

        ChatMessage chatMessage = ChatMessage.builder()
                .conversationId(conversation.getId())
                .message(message)
                .sender(ParticipantInfo.builder()
                        .userId(senderId)
                        .username(senderName)
                        .build())
                .createdDate(Instant.now())
                .build();
        chatMessageRepository.save(chatMessage);
    }

    public List<ChatMessageResponse> getAiHistory(String userId) {
        var conversation = conversationRepository.findAll().stream()
                .filter(c -> "AI".equals(c.getType()) && userId.equals(c.getClientId()))
                .findFirst()
                .orElse(null);

        if (conversation == null) return List.of();

        return chatMessageRepository.findAllByConversationIdOrderByCreatedDateDesc(conversation.getId()).stream()
                .map(this::toChatMessageResponse)
                .toList();
    }
}
