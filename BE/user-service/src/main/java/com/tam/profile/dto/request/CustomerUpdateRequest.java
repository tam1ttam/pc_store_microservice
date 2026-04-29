package com.tam.profile.dto.request;

import jakarta.validation.constraints.Email;
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
public class CustomerUpdateRequest {
    @Size(min = 1, max = 50, message = "Tên phải từ 1-50 ký tự")
    String firstName;

    @Size(min = 1, max = 50, message = "Họ phải từ 1-50 ký tự")
    String lastName;

    @Email(message = "Email không hợp lệ")
    String email;

    @Pattern(regexp = "^0[0-9]{9}$", message = "Số điện thoại phải bắt đầu bằng 0 và có 10 chữ số")
    String phoneNumber;

    // NOTE: Không thể cập nhật password qua endpoint này
    // Để thay đổi password, sử dụng Identity Service
}
