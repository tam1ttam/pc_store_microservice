package com.tam.chat.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.tam.chat.entity.WebSocketSession;

@Repository
public interface WebSocketSessionRepository extends MongoRepository<WebSocketSession, String> {
    void deleteBySocketSessionId(String socketId);

    List<WebSocketSession> findAllByUserIdIn(List<String> userIds);

    Optional<WebSocketSession> findBySocketSessionId(String socketSessionId);

    boolean existsByUserId(String userId);

    Optional<WebSocketSession> findFirstByUserId(String userId);
}
