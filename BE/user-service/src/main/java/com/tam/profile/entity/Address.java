package com.tam.profile.entity;

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
public class Address {
    String id;
    String country;
    String province;
    String city;
    String ward;
    String street;
    Boolean isDefault;
    List<String> phoneContacts;

    @Builder.Default
    Boolean isActive = true;
}
