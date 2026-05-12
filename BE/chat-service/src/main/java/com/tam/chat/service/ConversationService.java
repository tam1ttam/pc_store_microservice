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
    ProfileGrpcClient profileGrpcClient;
    IdentityClient identityClient;
    SocketIOServer socketIOServer;
    ObjectMapper objectMapper;
    ConversationMapper conversationMapper;

    // Client: get or create their support conversation
    public ConversationResponse getOrCreateStoreChat() {
        String clientId = SecurityContextHolder.getContext().getAuthentication().getName();
        return conversationRepository
                .findSupportConversationByClientId(clientId)
                .map(this::toConversationResponse)
                .orElseGet(() -> createSupportConversation(clientId));
    }

    // Manager: list ALL support conversations
    public List<ConversationResponse> getAllSupportConversations() {
        return conversationRepository.findAllByType("SUPPORT").stream()
                .map(this::toConversationResponse)
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

        boolean alreadyParticipant =
                conversation.getParticipants().stream().anyMatch(p -> managerId.equals(p.getUserId()));
        if (!alreadyParticipant) {
            var managerInfo = profileGrpcClient.getProfileByUserId(managerId);
            ParticipantInfo.ParticipantInfoBuilder managerBuilder =
                    ParticipantInfo.builder().userId(managerId);
            if (managerInfo != null) {
                managerBuilder
                        .username(managerInfo.getUsername())
                        .firstName(managerInfo.getFirstName())
                        .lastName(managerInfo.getLastName())
                        .avatar(managerInfo.getAvatar());
            } else {
                String username = fetchManagerUsername(managerId);
                if (username != null) managerBuilder.username(username);
            }
            List<ParticipantInfo> updated = new ArrayList<>(conversation.getParticipants());
            updated.add(managerBuilder.build());
            conversation.setParticipants(updated);
        } else {
            // Already a participant but username might be null — backfill from identity-service
            conversation.getParticipants().stream()
                    .filter(p -> managerId.equals(p.getUserId()) && p.getUsername() == null)
                    .findFirst()
                    .ifPresent(p -> {
                        String username = fetchManagerUsername(managerId);
                        if (username != null) p.setUsername(username);
                    });
        }

        conversation.setAssignedManagerId(managerId);
        conversation.setModifiedDate(Instant.now());
        conversation = conversationRepository.save(conversation);

        broadcastConversationUpdate(conversation);
        return toConversationResponse(conversation);
    }

    // Manager: transfer to another manager
    public ConversationResponse transferConversation(String conversationId, String toManagerId) {
        String currentManagerId =
                SecurityContextHolder.getContext().getAuthentication().getName();

        Conversation conversation = conversationRepository
                .findById(conversationId)
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));

        if (!currentManagerId.equals(conversation.getAssignedManagerId())) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        boolean alreadyParticipant =
                conversation.getParticipants().stream().anyMatch(p -> toManagerId.equals(p.getUserId()));

        if (!alreadyParticipant) {
            var m = profileGrpcClient.getProfileByUserId(toManagerId);
            ParticipantInfo.ParticipantInfoBuilder newManagerBuilder =
                    ParticipantInfo.builder().userId(toManagerId);
            if (m != null) {
                newManagerBuilder
                        .username(m.getUsername())
                        .firstName(m.getFirstName())
                        .lastName(m.getLastName())
                        .avatar(m.getAvatar());
            } else {
                String username = fetchManagerUsername(toManagerId);
                if (username != null) newManagerBuilder.username(username);
            }
            List<ParticipantInfo> updated = new ArrayList<>(conversation.getParticipants());
            updated.add(newManagerBuilder.build());
            conversation.setParticipants(updated);
        }

        conversation.setAssignedManagerId(toManagerId);
        conversation.setModifiedDate(Instant.now());
        conversation = conversationRepository.save(conversation);

        broadcastConversationUpdate(conversation);
        return toConversationResponse(conversation);
    }

    // Manager: get list of all managers for transfer picker
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

    // DIRECT conversation between two users (supports managers who have no user-service profile)
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

    // List conversations for the current user
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

        List<ParticipantInfo> participants = new ArrayList<>();
        participants.add(ParticipantInfo.builder()
                .userId(clientInfo.getUserId())
                .username(clientInfo.getUsername())
                .firstName(clientInfo.getFirstName())
                .lastName(clientInfo.getLastName())
                .avatar(clientInfo.getAvatar())
                .build());

        if (assignedManagerId != null) {
            var managerInfo = profileGrpcClient.getProfileByUserId(assignedManagerId);
            ParticipantInfo.ParticipantInfoBuilder managerBuilder =
                    ParticipantInfo.builder().userId(assignedManagerId);
            if (managerInfo != null) {
                managerBuilder
                        .username(managerInfo.getUsername())
                        .firstName(managerInfo.getFirstName())
                        .lastName(managerInfo.getLastName())
                        .avatar(managerInfo.getAvatar());
            } else {
                String username = fetchManagerUsername(assignedManagerId);
                if (username != null) managerBuilder.username(username);
            }
            participants.add(managerBuilder.build());
        }

        String hash = generateParticipantHash(
                participants.stream().map(ParticipantInfo::getUserId).sorted().toList());

        Conversation conversation = conversationRepository.save(Conversation.builder()
                .type("SUPPORT")
                .participantsHash(hash)
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
            String managerName = conversation.getParticipants().stream()
                    .filter(p -> conversation.getAssignedManagerId().equals(p.getUserId()))
                    .map(ParticipantInfo::getUsername)
                    .filter(Objects::nonNull)
                    .findFirst()
                    .orElseGet(() -> fetchManagerUsername(conversation.getAssignedManagerId()));
            response.setAssignedManagerName(managerName);
        }
        if (conversation.getParticipants() != null
                && !conversation.getParticipants().isEmpty()) {
            var first = conversation.getParticipants().get(0);
            response.setConversationName(first.getUsername());
            response.setConversationAvatar(first.getAvatar());
        }
        return response;
    }

    private String generateParticipantHash(List<String> ids) {
        StringJoiner joiner = new StringJoiner("_");
        ids.forEach(joiner::add);
        return joiner.toString();
    }

    private ConversationResponse toConversationResponse(Conversation conversation) {
        String currentUserId =
                SecurityContextHolder.getContext().getAuthentication().getName();

        ConversationResponse response = conversationMapper.toConversationResponse(conversation);

        conversation.getParticipants().stream()
                .filter(p -> !p.getUserId().equals(currentUserId))
                .findFirst()
                .ifPresent(p -> {
                    response.setConversationName(p.getUsername());
                    response.setConversationAvatar(p.getAvatar());
                });

        if (conversation.getAssignedManagerId() != null) {
            String managerName = conversation.getParticipants().stream()
                    .filter(p -> conversation.getAssignedManagerId().equals(p.getUserId()))
                    .map(ParticipantInfo::getUsername)
                    .filter(Objects::nonNull)
                    .findFirst()
                    .orElseGet(() -> fetchManagerUsername(conversation.getAssignedManagerId()));
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
}
