package com.devteria.identity.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.devteria.identity.entity.UserVisit;

public interface UserVisitRepository extends JpaRepository<UserVisit, Long> {
    Optional<UserVisit> findByUserId(String userId);
}
