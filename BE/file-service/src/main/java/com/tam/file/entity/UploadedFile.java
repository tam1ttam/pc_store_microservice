package com.tam.file.entity;

import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@Document(collection = "uploaded_files")
public class UploadedFile {
    @Id
    String id;

    String url;
    String publicId;
    String format;
    long fileSize;
    String fileType;   // folder: "product", "detail", etc.
    String resourceType; // "image" or "video"

    @Builder.Default
    Instant uploadedAt = Instant.now();
}
