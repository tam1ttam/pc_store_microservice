package com.devteria.identity.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "user_visits")
public class UserVisit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String userId;

    private long visitCount;
    private LocalDateTime lastVisit;
}
