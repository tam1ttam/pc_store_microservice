package com.devteria.identity.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.devteria.identity.entity.HistoryAction;

@Repository
public interface HistoryActionRepository extends JpaRepository<HistoryAction, String> {}
