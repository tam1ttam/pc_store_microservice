package com.tam.file.service.impl;

import java.util.Base64;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.devteria.file.dto.response.UploadImageResponse;
import com.devteria.file.dto.response.ValidateImageResponse;
import com.devteria.file.exception.FileUploadException;
import com.devteria.file.exception.ImageValidationException;
import com.devteria.file.exception.InvalidImageFormatException;
import com.devteria.file.service.FileService;
import com.devteria.file.service.ImageValidationService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@Transactional
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class FileServiceImpl implements FileService {

    Cloudinary cloudinary;
    ImageValidationService imageValidationService;

    @Override
    public UploadImageResponse uploadImage(String base64Image, String fileType) {
        log.info("Uploading image with fileType: {}", fileType);

        try {
            // TODO: Validate image with Gemini API
            if (!imageValidationService.isImageSafe(base64Image)) {
                throw new ImageValidationException("Image contains sensitive/unsafe content");
            }

            String cleanBase64 = extractBase64Content(base64Image);
            byte[] imageBytes = Base64.getDecoder().decode(cleanBase64);

            // Upload to Cloudinary
            Map uploadResult = cloudinary
                    .uploader()
                    .upload(
                            imageBytes,
                            ObjectUtils.asMap(
                                    "resource_type", "image",
                                    "folder", "PC_Store/" + fileType));

            String url = uploadResult.get("url").toString();
            String publicId = uploadResult.get("public_id").toString();
            long fileSize = (long) uploadResult.get("bytes");
            String format = uploadResult.get("format").toString();

            log.info("Image uploaded successfully. URL: {}", url);

            return UploadImageResponse.builder()
                    .url(url)
                    .publicId(publicId)
                    .fileSize(fileSize)
                    .format(format)
                    .build();

        } catch (ImageValidationException e) {
            throw e;
        } catch (Exception e) {
            log.error("Upload failed: ", e);
            throw new FileUploadException("Failed to upload image: " + e.getMessage(), e);
        }
    }

    @Override
    public ValidateImageResponse validateImage(String base64Image) {
        log.info("Validating image");

        try {
            boolean isSafe = imageValidationService.isImageSafe(base64Image);

            return ValidateImageResponse.builder()
                    .safe(isSafe)
                    .message(isSafe ? "Image is safe" : "Image contains unsafe content")
                    .build();

        } catch (Exception e) {
            log.error("Validation failed: ", e);
            throw new ImageValidationException("Failed to validate image: " + e.getMessage(), e);
        }
    }

    @Override
    public void deleteImage(String publicId) {
        log.info("Deleting image: {}", publicId);

        try {
            cloudinary.uploader().destroy(publicId, ObjectUtils.asMap("resource_type", "image"));
            log.info("Image deleted successfully: {}", publicId);

        } catch (Exception e) {
            log.error("Delete failed: ", e);
            throw new FileUploadException("Failed to delete image: " + e.getMessage(), e);
        }
    }

    private String extractBase64Content(String base64Image) {
        if (base64Image.startsWith("data:image")) {
            String[] parts = base64Image.split(",");
            if (parts.length > 1) {
                return parts[1];
            }
            throw new InvalidImageFormatException("Invalid base64 image format");
        }
        return base64Image;
    }
}
