package com.tam.identity.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.*;

@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString
@EqualsAndHashCode
public class Permission {
    @Id
    @EqualsAndHashCode.Include
    private String name; // Ví dụ: "CREATE_POST", "DELETE_USER", "VIEW_REVENUE"
    private String description;
}