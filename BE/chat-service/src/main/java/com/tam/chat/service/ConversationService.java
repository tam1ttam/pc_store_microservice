package com.tam.chat.service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.StringJoiner;
import java.util.stream.Collectors;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.corundumstudio.socketio.SocketIOServer;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.tam.chat.dto.request.ConversationRequest;
import com.tam.chat.dto.response.ConversationResponse;
import com.tam.chat.dto.response.ManagerInfoResponse;
import com.tam.chat.entity.Conversation;
import com.tam.chat.entity.ParticipantInfo;
import com.tam.chat.exception.AppException;
import com.tam.chat.exception.ErrorCode;
import com.tam.chat.mapper.ConversationMapper;
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
public class ConversationService {
    ConversationRepository conversationRepository;
    WebSocketSessionRepository webSocketSessionRepository;
    ProfileGrpcClient profileGrpcClient;
    IdentityClient identityClient;
    SocketIOServer socketIOServer;
    ObjectMapper objectMapper;
    ConversationMapper conversationMapper;

    // Client: get or create their SUPPORT conversation
    public ConversationResponse getOrCreateStoreChat() {
        String clientId = SecurityContextHolder.getContext().getAuthentication().getName();
        return conversationRepository
                .findSupportConversationByClientId(clientId)
                .map(this::toConversationResponse)
                .orElseGet(() -> createSupportConversation(clientId));
    }

    // Manager: list ALL support conversations (fetch manager name map once for efficiency)
    public List<ConversationResponse> getAllSupportConversations() {
        Map<String, String> managerNames = getManagerNameMap();
        return conversationRepository.findAllByType("SUPPORT").stream()
                .map(c -> toConversationResponse(c, managerNames))
                .toList();
    }

    // Manager: claim an unassigned conversation
    public ConversationResponse claimConversation(String conversationId) {
        String managerId =
                SecurityContextHolder.getContext().getAuthentication().getName();
        Conversation conversation = conversationRepository
                .findById(conversationId)
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));

        if (managerId.equals(conversation.getAssignedManagerId())) {
            return toConversationResponse(conversation);
        }
        if (conversation.getAssignedManagerId() != null) {
            throw new AppException(ErrorCode.CONVERSATION_ALREADY_CLAIMED);
        }

        // SUPPORT: managers are NOT stored in participants — just update assignedManagerId
        conversation.setAssignedManagerId(managerId);
        conversation.setModifiedDate(Instant.now());
        conversation = conversationRepository.save(conversation);

        broadcastConversationUpdate(conversation);
        return toConversationResponse(conversation);
    }

    // Manager: transfer responsibility to another manager
    public ConversationResponse transferConversation(String conversationId, String toManagerId) {
        String currentManagerId =
                SecurityContextHolder.getContext().getAuthentication().getName();
        Conversation conversation = conversationRepository
                .findById(conversationId)
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));

        if (!currentManagerId.equals(conversation.getAssignedManagerId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        // SUPPORT: managers are NOT stored in participants — just update assignedManagerId
        conversation.setAssignedManagerId(toManagerId);
        conversation.setModifiedDate(Instant.now());
        conversation = conversationRepository.save(conversation);

        broadcastConversationUpdate(conversation);
        return toConversationResponse(conversation);
    }

    // Manager: get list of all managers for transfer/new-chat picker
    public List<ManagerInfoResponse> getManagerList() {
        try {
            var response = identityClient.getManagerDetails();
            if (response != null && response.getResult() != null) {
                return response.getResult();
            }
        } catch (FeignException e) {
            log.warn("Could not fetch manager list from identity-service: {}", e.getMessage());
        }
        return List.of();
    }

    // Manager: get IDs of managers who currently have an active socket session
    public List<String> getOnlineManagerIds() {
        return fetchManagerIds().stream()
                .filter(webSocketSessionRepository::existsByUserId)
                .collect(Collectors.toList());
    }

    // DIRECT conversation between two users (supports managers without user-service profile)
    public ConversationResponse create(ConversationRequest request) {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        String participantId = request.getParticipantIds().getFirst();

        List<String> sortedIds = new ArrayList<>(List.of(userId, participantId));
        sortedIds.sort(String::compareTo);
        String hash = generateParticipantHash(sortedIds);

        var conversation = conversationRepository.findByParticipantsHash(hash).orElseGet(() -> {
            ParticipantInfo selfInfo = buildParticipantInfo(userId);
            ParticipantInfo otherInfo = buildParticipantInfo(participantId);
            String type = request.getType() != null ? request.getType() : "DIRECT";

            return conversationRepository.save(Conversation.builder()
                    .type(type)
                    .participantsHash(hash)
                    .createdDate(Instant.now())
                    .modifiedDate(Instant.now())
                    .participants(List.of(selfInfo, otherInfo))
                    .build());
        });

        return toConversationResponse(conversation);
    }

    // List conversations where current user is a participant (DIRECT conversations)
    public List<ConversationResponse> myConversations() {
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        return conversationRepository.findAllByParticipantIdsContains(userId).stream()
                .map(this::toConversationResponse)
                .toList();
    }

    // --- Helpers ---

    private ConversationResponse createSupportConversation(String clientId) {
        var clientInfo = profileGrpcClient.getProfileByUserId(clientId);
        if (Objects.isNull(clientInfo)) {
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }

        String assignedManagerId = autoAssignManager();

        // SUPPORT: only the client is stored in participants.
        // Hash = clientId ensures one SUPPORT conversation per client,
        // completely independent of which managers are assigned.
        List<ParticipantInfo> participants = List.of(ParticipantInfo.builder()
                .userId(clientInfo.getUserId())
                .username(clientInfo.getUsername())
                .firstName(clientInfo.getFirstName())
                .lastName(clientInfo.getLastName())
                .avatar(clientInfo.getAvatar())
                .build());

        Conversation conversation = conversationRepository.save(Conversation.builder()
                .type("SUPPORT")
                .participantsHash(clientId)
                .participants(participants)
                .clientId(clientId)
                .assignedManagerId(assignedManagerId)
                .createdDate(Instant.now())
                .modifiedDate(Instant.now())
                .build());

        broadcastConversationUpdate(conversation);
        return toConversationResponse(conversation);
    }

    private String autoAssignManager() {
        List<String> ids = fetchManagerIds();
        if (ids.isEmpty()) return null;

        List<Conversation> supportConvs = conversationRepository.findAllByType("SUPPORT");
        Map<String, Long> loadMap = ids.stream().collect(Collectors.toMap(id -> id, id -> supportConvs.stream()
                .filter(c -> id.equals(c.getAssignedManagerId()))
                .count()));

        return loadMap.entrySet().stream()
                .min(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey)
                .orElse(ids.get(0));
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
                response.setAssignedManagerName(fetchManagerUsername(conversation.getAssignedManagerId()));
            } else {
                String name = conversation.getParticipants().stream()
                        .filter(p -> conversation.getAssignedManagerId().equals(p.getUserId()))
                        .map(ParticipantInfo::getUsername)
                        .filter(Objects::nonNull)
                        .findFirst()
                        .orElseGet(() -> fetchManagerUsername(conversation.getAssignedManagerId()));
                response.setAssignedManagerName(name);
            }
        }

        // For SUPPORT: participants[0] is always the client — use as conversation display name
        if (conversation.getParticipants() != null
                && !conversation.getParticipants().isEmpty()) {
            var first = conversation.getParticipants().get(0);
            response.setConversationName(first.getUsername());
            response.setConversationAvatar(first.getAvatar());
        }

        return response;
    }

    // Single-call variant (claim, transfer, create, getOrCreate)
    private ConversationResponse toConversationResponse(Conversation conversation) {
        return toConversationResponse(conversation, null);
    }

    // Batch-aware variant: accepts pre-fetched manager name map to avoid N calls to identity-service
    private ConversationResponse toConversationResponse(Conversation conversation, Map<String, String> managerNameMap) {
        String currentUserId =
                SecurityContextHolder.getContext().getAuthentication().getName();
        ConversationResponse response = conversationMapper.toConversationResponse(conversation);

        if ("SUPPORT".equals(conversation.getType())) {
            // Manager view: show client info as the "other side"
            // Client view: conversationName stays null — FE shows store name
            if (!currentUserId.equals(conversation.getClientId())) {
                conversation.getParticipants().stream()
                        .filter(p -> conversation.getClientId().equals(p.getUserId()))
                        .findFirst()
                        .ifPresent(p -> {
                            response.setConversationName(p.getUsername());
                            response.setConversationAvatar(p.getAvatar());
                        });
            }
        } else {
            // DIRECT: show the other participant
            conversation.getParticipants().stream()
                    .filter(p -> !p.getUserId().equals(currentUserId))
                    .findFirst()
                    .ifPresent(p -> {
                        response.setConversationName(p.getUsername());
                        response.setConversationAvatar(p.getAvatar());
                    });
        }

        if (conversation.getAssignedManagerId() != null) {
            String managerName =
                    (managerNameMap != null) ? managerNameMap.get(conversation.getAssignedManagerId()) : null;
            if (managerName == null) {
                managerName = fetchManagerUsername(conversation.getAssignedManagerId());
            }
            response.setAssignedManagerName(managerName);
        }

        return response;
    }

    private ParticipantInfo buildParticipantInfo(String userId) {
        var profile = profileGrpcClient.getProfileByUserId(userId);
        if (profile != null) {
            return ParticipantInfo.builder()
                    .userId(profile.getUserId())
                    .username(profile.getUsername())
                    .firstName(profile.getFirstName())
                    .lastName(profile.getLastName())
                    .avatar(profile.getAvatar())
                    .build();
        }
        // Fallback for managers who have no user-service profile
        String username = fetchManagerUsername(userId);
        return ParticipantInfo.builder().userId(userId).username(username).build();
    }

    private Map<String, String> getManagerNameMap() {
        try {
            var response = identityClient.getManagerDetails();
            if (response != null && response.getResult() != null) {
                return response.getResult().stream()
                        .filter(m -> m.getId() != null && m.getUsername() != null)
                        .collect(Collectors.toMap(ManagerInfoResponse::getId, ManagerInfoResponse::getUsername));
            }
        } catch (FeignException e) {
            log.warn("Could not fetch manager name map: {}", e.getMessage());
        }
        return Map.of();
    }

    private List<String> fetchManagerIds() {
        try {
            var response = identityClient.getManagerIds();
            if (response != null && response.getResult() != null) {
                return response.getResult();
            }
        } catch (FeignException e) {
            log.warn("Could not fetch manager IDs from identity-service: {}", e.getMessage());
        }
        return List.of();
    }

    private String fetchManagerUsername(String managerId) {
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
            log.warn("Could not fetch manager username from identity-service: {}", e.getMessage());
        }
        return null;
    }

    private String generateParticipantHash(List<String> ids) {
        StringJoiner joiner = new StringJoiner("_");
        ids.forEach(joiner::add);
        return joiner.toString();
    }
}
