package com.tam.identity.dtos.request.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    private String phoneNumber;
    private String password;
    private String firstName;
    private String lastName;
}
