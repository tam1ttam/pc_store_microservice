package com.devteria.notification.repository;

import java.util.List;
import java.util.Optional;

import org.bson.types.ObjectId;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import com.devteria.notification.entity.Notification;

public interface NotificationRepository extends MongoRepository<Notification, ObjectId> {

    List<Notification> findAllByUserIdOrderByIsSystemDescCreatedAtDesc(String userId);

    Page<Notification> findAllByUserId(String userId, Pageable pageable);

    @Query("{ 'userId': ?0, 'isRead': false }")
    List<Notification> findUnreadByUserId(String userId);

    long countByUserIdAndIsReadFalse(String userId);

    Optional<Notification> findByIdAndUserId(ObjectId id, String userId);

    @Query("{ 'userId': ?0, 'isRead': false }")
    long countUnreadByUserId(String userId);
}
