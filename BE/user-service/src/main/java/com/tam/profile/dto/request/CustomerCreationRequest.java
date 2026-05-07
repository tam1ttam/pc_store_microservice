package com.tam.profile.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

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
public class CustomerCreationRequest {
    @NotBlank(message = "Tên người dùng không được để trống")
    @Size(min = 3, max = 50, message = "Tên người dùng phải từ 3-50 ký tự")
    String userName;

    @NotNull(message = "Tên không được để trống")
    @Size(min = 1, max = 50, message = "Tên phải từ 1-50 ký tự")
    String firstName;

    @NotNull(message = "Họ không được để trống")
    @Size(min = 1, max = 50, message = "Họ phải từ 1-50 ký tự")
    String lastName;

    @NotNull(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    String email;

    @Pattern(regexp = "^0[0-9]{9}$", message = "Số điện thoại phải bắt đầu bằng 0 và có 10 chữ số")
    String phoneNumber;

    String avatar;
    String dob;
    String city;

    // NOTE: Không có password field
    // Password được quản lý bởi Identity Service
}
