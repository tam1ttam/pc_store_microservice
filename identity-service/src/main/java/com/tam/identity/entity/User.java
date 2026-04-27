package com.tam.identity.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import lombok.*;

import java.util.Set;

@Entity
@Table(name = "identity_users")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
@ToString
@EqualsAndHashCode
public class User {
    @Id
    @EqualsAndHashCode.Include
    private String identityUserId; // identityUserId từ Keycloak

//    @ManyToMany
//    private Set<Role> roles; // Một user có thể mang nhiều role backend
}