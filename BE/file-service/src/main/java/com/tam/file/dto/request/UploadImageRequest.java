package com.tam.file.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

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
public class UploadImageRequest {
    @NotBlank(message = "Image không được để trống")
    String base64Image;

    @NotNull(message = "Loại file không được để trống")
    String fileType; // "product", "avatar", "profile", etc.
}
