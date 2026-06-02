package com.tam.chat.entity;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Setter
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Attachment {
    String url;
    String originalFileName;
    String fileType; // "image", "video", "audio", "document"
}
