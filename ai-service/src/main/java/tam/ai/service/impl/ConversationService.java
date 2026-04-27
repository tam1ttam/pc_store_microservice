package tam.ai.service.impl;

import com.pc.store.server.dao.ConversationRepository;
import com.pc.store.server.dao.CustomerRespository;
import com.pc.store.server.dto.request.ConversationRequest;
import com.pc.store.server.dto.response.ConversationResponse;
import com.pc.store.server.entities.Conversation;
import com.pc.store.server.entities.Customer;
import com.pc.store.server.exception.AppException;
import com.pc.store.server.exception.ErrorCode;
import com.pc.store.server.mapper.ConversationMapper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.StringJoiner;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ConversationService {
    ConversationRepository conversationRepository;
    ConversationMapper conversationMapper;
    CustomerRespository customerRespository;

    public List<ConversationResponse> myConversations() {
        String userName = SecurityContextHolder.getContext().getAuthentication().getName();
        //        log.info("Get conversations for user: {}", userName);
        Customer user = customerRespository
                .findByUserName(userName)
                .orElseThrow(() -> new AppException(ErrorCode.CUSTOMER_NOT_FOUND));
        log.info("User ID: {}", user.getId());
        List<Conversation> conversations =
                conversationRepository.findAllByParticipantIdsContains(String.valueOf(user.getId()));

        return conversations.stream().map(this::toConversationResponse).toList();
    }

    public ConversationResponse create(ConversationRequest request) {
        // Fetch user infos
        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        var userInfoResponse = customerRespository.findByUserName(userId);
        var participantInfoResponse =
                customerRespository.findByUserName(request.getParticipantIds().get(0));

        if (Objects.isNull(userInfoResponse) || Objects.isNull(participantInfoResponse)) {
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }

        var userInfo = userInfoResponse.orElse(null);
        var participantInfo = participantInfoResponse.orElse(null);

        List<String> userIds = new ArrayList<>();
        userIds.add(userId);
        userIds.add(String.valueOf(participantInfo.getId()));

        var sortedIds = userIds.stream().sorted().toList();
        String userIdHash = generateParticipantHash(sortedIds);

        var conversation = conversationRepository
                .findByParticipantsHash(userIdHash)
                .orElseGet(() -> {
                    List<Customer> participantInfos = List.of(
                            Customer.builder()
                                    .id(userInfo.getId())
                                    .email(userInfo.getEmail())
                                    .roles(userInfo.getRoles())
                                    .firstName(userInfo.getFirstName())
                                    .lastName(userInfo.getLastName())
                                    .password(userInfo.getPassword())
                                    .userName(userInfo.getUserName())
                                    .phoneNumber(userInfo.getPhoneNumber())
                                    .build(),
                            Customer.builder()
                                    .id(participantInfo.getId())
                                    .email(participantInfo.getEmail())
                                    .roles(participantInfo.getRoles())
                                    .firstName(participantInfo.getFirstName())
                                    .lastName(participantInfo.getLastName())
                                    .password(participantInfo.getPassword())
                                    .userName(participantInfo.getUserName())
                                    .phoneNumber(participantInfo.getPhoneNumber())
                                    .build());

                    // Build conversation info
                    Conversation newConversation = Conversation.builder()
                            .type(request.getType())
                            .participantsHash(userIdHash)
                            .createdDate(Instant.now())
                            .modifiedDate(Instant.now())
                            .participants(participantInfos)
                            .build();

                    return conversationRepository.save(newConversation);
                });

        return toConversationResponse(conversation);
    }

    public String generateParticipantHash(List<String> ids) {
        StringJoiner stringJoiner = new StringJoiner("_");
        ids.forEach(stringJoiner::add);

        // SHA 256

        return stringJoiner.toString();
    }

    private ConversationResponse toConversationResponse(Conversation conversation) {
        String currentUserId =
                SecurityContextHolder.getContext().getAuthentication().getName();

        ConversationResponse conversationResponse = conversationMapper.toConversationResponse(conversation);

        conversation.getParticipants().stream()
                .filter(participantInfo -> !participantInfo.getId().equals(currentUserId))
                .findFirst()
                .ifPresent(participantInfo -> {
                    conversationResponse.setConversationName(
                            participantInfo.getFirstName() + " " + participantInfo.getLastName() + "|" + "ADMIN");
                    //                    conversationResponse.setConversationAvatar(participantInfo.getAvatar());
                });

        return conversationResponse;
    }
}
