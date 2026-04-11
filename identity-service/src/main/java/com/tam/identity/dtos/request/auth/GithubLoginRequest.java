package com.tam.identity.dtos.request.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GithubLoginRequest {
    private String code; // GitHub authorization code từ frontend
}
