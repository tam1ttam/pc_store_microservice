package com.devteria.identity.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.devteria.identity.entity.UserVisit;
import com.devteria.identity.repository.UserVisitRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserVisitService {
    private final UserVisitRepository userVisitRepository;

    @Transactional
    public void recordVisit(String userId) {
        UserVisit visit = userVisitRepository
                .findByUserId(userId)
                .orElseGet(
                        () -> UserVisit.builder().userId(userId).visitCount(0L).build());

        visit.setVisitCount(visit.getVisitCount() + 1);
        visit.setLastVisit(LocalDateTime.now());
        userVisitRepository.save(visit);
    }

    public List<UserVisit> getAllVisits() {
        return userVisitRepository.findAll();
    }
}
