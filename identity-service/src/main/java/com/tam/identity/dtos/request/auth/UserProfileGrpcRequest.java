package com.tam.identity.dtos.request.auth;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserProfileGrpcRequest {
    String identityUserId;
    String defaultPhoneNumber;
    String defaultEmail;
    String firstName;
    String lastName;
    String gender;
    String dateOfBirth; // "YYYY-MM-DD"
    String avatar;
}
