package com.tam.profile.entity;

import java.time.LocalDate;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
@Document(collection = "user_profiles")
public class UserProfile {
    @Id
    String id;

    String userId;
    String avatar;
    String username;
    String email;
    String firstName;
    String lastName;
    LocalDate dob;
    String city;
}
