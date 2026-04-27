package tam.ai.service.impl;

import com.corundumstudio.socketio.SocketIOServer;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pc.store.server.dao.ChatMessageRepository;
import com.pc.store.server.dao.ConversationRepository;
import com.pc.store.server.dao.CustomerRespository;
import com.pc.store.server.dao.WebSocketSessionRepository;
import com.pc.store.server.dto.request.ChatMessageRequest;
import com.pc.store.server.dto.response.ChatMessageResponse;
import com.pc.store.server.entities.ChatMessage;
import com.pc.store.server.entities.Customer;
import com.pc.store.server.entities.WebSocketSession;
import com.pc.store.server.exception.AppException;
import com.pc.store.server.exception.ErrorCode;
import com.pc.store.server.mapper.ChatMessageMapper;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ChatMessageService {
    SocketIOServer socketIOServer;

    ChatMessageRepository chatMessageRepository;
    ConversationRepository conversationRepository;
    WebSocketSessionRepository webSocketSessionRepository;

    ObjectMapper objectMapper;
    ChatMessageMapper chatMessageMapper;
    CustomerRespository customerRespository;

    public List<ChatMessageResponse> getMessages(String conversationId) {
        // Validate conversationId
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Customer customer = customerRespository
                .findByUserName(username)
                .orElseThrow(() -> new AppException(ErrorCode.CUSTOMER_NOT_FOUND));
        conversationRepository
                .findById(conversationId)
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND))
                .getParticipants()
                .stream()
                .filter(participantInfo -> customer.getId().equals(participantInfo.getId()))
                .findAny()
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));

        var messages = chatMessageRepository.findAllByConversationIdOrderByCreatedDateDesc(conversationId);

        return messages.stream().map(this::toChatMessageResponse).toList();
    }

    public ChatMessageResponse create(ChatMessageRequest request) throws JsonProcessingException {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();

        var conversation = conversationRepository
                .findById(request.getConversationId())
                .orElseThrow(() -> new AppException(ErrorCode.CONVERSATION_NOT_FOUND));

        var userResponse = customerRespository.findByUserName(username);
        if (Objects.isNull(userResponse)) {
            throw new AppException(ErrorCode.UNCATEGORIZED_EXCEPTION);
        }
        var userInfo = userResponse.get();

        // Build Chat message
        ChatMessage chatMessage = chatMessageMapper.toChatMessage(request);
        chatMessage.setSender(userInfo); // ✅ Lưu toàn bộ Customer object
        chatMessage.setCreatedDate(Instant.now());
        chatMessage = chatMessageRepository.save(chatMessage);

        // Get participants IDs
        List<String> userIds = conversation.getParticipants().stream()
                .map(Customer::getId)
                .map(String::valueOf)
                .toList();

        Map<String, WebSocketSession> webSocketSessions = webSocketSessionRepository.findAllByUserIdIn(userIds).stream()
                .collect(Collectors.toMap(WebSocketSession::getSocketSessionId, Function.identity()));

        ChatMessageResponse chatMessageResponse = chatMessageMapper.toChatMessageResponse(chatMessage);

        socketIOServer.getAllClients().forEach(client -> {
            var webSocketSession = webSocketSessions.get(client.getSessionId().toString());

            if (Objects.nonNull(webSocketSession)) {
                try {
                    // ✅ So sánh ID với ID
                    chatMessageResponse.setMe(webSocketSession.getUserId().equals(String.valueOf(userInfo.getId())));
                    String message = objectMapper.writeValueAsString(chatMessageResponse);
                    client.sendEvent("send_message", message);
                } catch (JsonProcessingException e) {
                    throw new RuntimeException(e);
                }
            }
        });

        return toChatMessageResponse(chatMessage);
    }

    private ChatMessageResponse toChatMessageResponse(ChatMessage chatMessage) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        var chatMessageResponse = chatMessageMapper.toChatMessageResponse(chatMessage);

        // ✅ So sánh username với username
        chatMessageResponse.setMe(username.equals(chatMessage.getSender().getUserName()));

        return chatMessageResponse;
    }
}
