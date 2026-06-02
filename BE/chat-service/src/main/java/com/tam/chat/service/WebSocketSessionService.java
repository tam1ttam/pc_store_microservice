package com.tam.chat.service;

import java.util.Optional;

import org.springframework.stereotype.Service;

import com.tam.chat.entity.WebSocketSession;
import com.tam.chat.repository.WebSocketSessionRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class WebSocketSessionService {
    WebSocketSessionRepository webSocketSessionRepository;

    public WebSocketSession create(WebSocketSession webSocketSession) {
        return webSocketSessionRepository.save(webSocketSession);
    }

    public void deleteSession(String socketSessionId) {
        webSocketSessionRepository.deleteBySocketSessionId(socketSessionId);
    }

    public Optional<String> getUserIdBySocketId(String socketSessionId) {
        return webSocketSessionRepository.findBySocketSessionId(socketSessionId).map(WebSocketSession::getUserId);
    }

    public boolean isUserOnline(String userId) {
        return webSocketSessionRepository.existsByUserId(userId);
    }
}
