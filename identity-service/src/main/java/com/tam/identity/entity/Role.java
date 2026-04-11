package com.tam.identity.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import lombok.*;

import java.util.Set;

@Entity
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString
@EqualsAndHashCode
public class Role {
    @Id
    @EqualsAndHashCode.Include
    private String name; // Ví dụ: "CLIENT", "SELLER", "MODERATOR"

    @ManyToMany(fetch = FetchType.EAGER)
    private Set<Permission> permissions;
}
