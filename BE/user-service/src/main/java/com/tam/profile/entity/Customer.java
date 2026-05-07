package com.tam.profile.entity;

import java.time.LocalDate;

import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.ser.std.ToStringSerializer;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Document(collection = "profiles")
@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Getter
@Setter
public class Customer {
    @Id
    @Field("_id")
    @JsonSerialize(using = ToStringSerializer.class)
    ObjectId id;

    @Indexed(unique = true)
    String userId;

    String userName;

    String firstName;
    String lastName;
    String email;
    String phoneNumber;
    String avatar;
    LocalDate dob;
    String city;

    // NOTE: Không lưu password trong Profile Service
    // Password được quản lý bởi Identity Service
    // TODO: Gọi Identity Service để verify user identity khi cần
}
