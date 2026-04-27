package com.tam.identity.services;

import com.tam.identity.dtos.response.auth.AuthTokenResponse;
import com.tam.identity.dtos.response.auth.DeleteAccountResponse;
import com.tam.identity.dtos.response.auth.MeResponse;

import java.util.Map;
import java.util.Set;

public interface UserService {

    Set<String> getUserPermissions(String identityUserId);
    AuthTokenResponse handleRegisterCallback(String code);
    DeleteAccountResponse handleDeleteAccountCallback(String code);
    MeResponse me(String accessToken);
    AuthTokenResponse refreshAccessToken(String refreshToken);
    void revokeToken(String refreshToken);
}
