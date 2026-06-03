package com.tam.profile.dto.response;

import java.util.List;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ProfileResponse {
    String id;
    String userName;
    String firstName;
    String lastName;
    String email;
    String phoneNumber;
    String avatar;
    String dob;
    String gender;
    Boolean isActive;
    List<AddressResponse> addresses;
}
