package com.tam.file.controller;

import com.tam.file.dto.ApiResponse;
import com.tam.file.dto.response.UploadImageResponse;
import com.tam.file.service.impl.FileServiceImpl;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Base64;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class FileController {
    FileServiceImpl fileServiceImpl;

    @PostMapping("/media/upload")
    ApiResponse<UploadImageResponse> uploadMedia(@RequestParam("file") MultipartFile file) throws IOException {
        String base64Image = "data:" + file.getContentType() + ";base64," + Base64.getEncoder().encodeToString(file.getBytes());
        return ApiResponse.<UploadImageResponse>builder()
                .result(fileServiceImpl.uploadImage(base64Image, "chat-attachments"))
                .build();
    }

    @GetMapping("/media/download/{fileName}")
    ResponseEntity<Resource> downloadMedia(@PathVariable String fileName) throws IOException {
        var fileData = fileService.download(fileName);

        return ResponseEntity.<Resource>ok()
                .header(HttpHeaders.CONTENT_TYPE, fileData.contentType())
                .body(fileData.resource());
    }
}
