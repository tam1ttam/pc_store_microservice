package com.tam.identity.dtos.response.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GoogleUserInfo {
    private String sub;              // Unique Google ID
    private String email;
    private String name;
    private String given_name;       // First name
    private String family_name;      // Last name
    private String picture;          // Avatar URL
    private boolean email_verified;
}
