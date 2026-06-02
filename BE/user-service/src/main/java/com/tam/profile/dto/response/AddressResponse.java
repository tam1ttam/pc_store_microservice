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
public class AddressResponse {
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
