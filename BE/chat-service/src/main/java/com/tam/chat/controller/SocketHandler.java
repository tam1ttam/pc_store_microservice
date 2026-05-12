package com.tam.chat.controller;

import java.time.Instant;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;

import org.springframework.stereotype.Component;

import com.corundumstudio.socketio.SocketIOClient;
import com.corundumstudio.socketio.SocketIOServer;
import com.corundumstudio.socketio.annotation.OnConnect;
import com.corundumstudio.socketio.annotation.OnDisconnect;
import com.tam.chat.entity.WebSocketSession;
import com.tam.chat.repository.httpclient.IdentityClient;
import com.tam.chat.service.JwtService;
import com.tam.chat.service.WebSocketSessionService;

import feign.FeignException;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class SocketHandler {
    SocketIOServer server;
    JwtService jwtService;
    WebSocketSessionService webSocketSessionService;
    IdentityClient identityClient;

    @OnConnect
    public void clientConnected(SocketIOClient client) {
        String token = client.getHandshakeData().getSingleUrlParam("token");
        String userId = jwtService.extractUserIdFromToken(token);

        if (userId != null) {
            log.info("Socket connected: sessionId={}, userId={}", client.getSessionId(), userId);
            String username = fetchManagerUsername(userId);
            WebSocketSession session = WebSocketSession.builder()
                    .socketSessionId(client.getSessionId().toString())
                    .userId(userId)
                    .username(username)
                    .createdAt(Instant.now())
                    .build();
            session = webSocketSessionService.create(session);
            log.info("WebSocketSession created: id={}, username={}", session.getId(), username);
            String connectedUserId = userId;
            server.getAllClients().forEach(c -> c.sendEvent("user_online", connectedUserId));
        } else {
            log.error("Socket auth failed: sessionId={}", client.getSessionId());
            client.disconnect();
        }
    }

    @OnDisconnect
    public void clientDisconnected(SocketIOClient client) {
        String socketId = client.getSessionId().toString();
        log.info("Socket disconnected: sessionId={}", socketId);
        webSocketSessionService.getUserIdBySocketId(socketId).ifPresent(userId -> {
            log.info("Broadcasting user_offline: userId={}", userId);
            server.getAllClients().forEach(c -> c.sendEvent("user_offline", userId));
        });
        webSocketSessionService.deleteSession(socketId);
    }

    @PostConstruct
    public void startServer() {
        server.addListeners(this);
        server.start();
        log.info("Socket server started on port 8099");
    }

    @PreDestroy
    public void stopServer() {
        server.stop();
        log.info("Socket server stopped");
    }

    private String fetchManagerUsername(String userId) {
        try {
            var response = identityClient.getManagerDetails();
            if (response != null && response.getResult() != null) {
                return response.getResult().stream()
                        .filter(m -> userId.equals(m.getId()))
                        .map(m -> m.getUsername())
                        .findFirst()
                        .orElse(null);
            }
        } catch (FeignException e) {
            log.warn("Could not fetch manager username at connect for userId={}: {}", userId, e.getMessage());
        }
        return null;
    }
}
