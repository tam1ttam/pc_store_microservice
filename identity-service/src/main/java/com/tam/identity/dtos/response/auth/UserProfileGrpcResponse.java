package com.tam.identity.dtos.response.auth;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Data;
import lombok.experimental.FieldDefaults;

import java.util.List;

@Data
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserProfileGrpcResponse {
    String id;
    String identityUserId;
    String defaultPhoneNumber;
    String defaultEmail;
    String firstName;
    String lastName;
    String gender;
    String dateOfBirth;
    String avatar;
    Boolean isActive;
    List<AddressGrpcResponse> addresses;

    @Data
    @Builder
    public static class AddressGrpcResponse {
        String id;
        String country;
        String province;
        String city;
        String ward;
        String street;
        Boolean isDefault;
        List<String> phoneContacts;
        Boolean isActive;
    }
}
