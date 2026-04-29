package com.devteria.identity.dto.request;

import com.fasterxml.jackson.annotation.JsonAlias;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AuthenticationRequest {
    @JsonAlias("userName")
    String username;

    String password;
}
