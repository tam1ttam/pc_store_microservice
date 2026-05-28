package com.devteria.identity.service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.devteria.identity.entity.HistoryAction;
import com.devteria.identity.entity.User;
import com.devteria.identity.repository.HistoryActionRepository;
import com.devteria.identity.repository.UserRepository;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AdminService {
    HistoryActionRepository historyActionRepository;
    UserRepository userRepository;
    RoleRepository roleRepository;

    public List<Role> getAllRoles() {
        return roleRepository.findAll();
    }

    public List<HistoryAction> getAllHistory() {
        return historyActionRepository.findAll();
    }

    public void createHistory(String title, String description, String status, String targetId, String note) {
        HistoryAction historyAction = new HistoryAction();
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByUsername(username).orElseThrow(() -> new RuntimeException("User not found"));
        historyAction.setUser(user);
        historyAction.setTitle(title);
        historyAction.setDescription(description);
        historyAction.setStatus(status);
        historyAction.setTargetId(targetId);
        historyAction.setNote(note);
        historyAction.setCreatedAt(LocalDateTime.from(Instant.now()));
        historyActionRepository.save(historyAction);
    }
}
