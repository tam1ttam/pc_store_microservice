package com.tam.file.service.impl;

import java.util.Base64;

import org.springframework.stereotype.Service;

import com.tam.file.dto.response.UploadImageResponse;
import com.tam.file.dto.response.ValidateImageResponse;
import com.tam.file.entity.UploadedFile;
import com.tam.file.exception.FileUploadException;
import com.tam.file.exception.ImageValidationException;
import com.tam.file.exception.InvalidImageFormatException;
import com.tam.file.repository.UploadedFileRepository;
import com.tam.file.service.ImageValidationService;
import com.tam.file.service.S3FileUploadService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class FileServiceImpl {

	S3FileUploadService s3Service;
	ImageValidationService imageValidationService;
	UploadedFileRepository uploadedFileRepository;

	public UploadImageResponse uploadImage(String base64Image, String fileType) {
		log.info("Uploading file to S3 with fileType: {}", fileType);

		try {
			boolean isVideo = isVideoContent(base64Image);

			if (!isVideo && !imageValidationService.isImageSafe(base64Image)) {
				throw new ImageValidationException("Image contains sensitive/unsafe content");
			}

			String mimeType = extractMimeType(base64Image);
			String cleanBase64 = extractBase64Content(base64Image);
			byte[] fileBytes = Base64.getDecoder().decode(cleanBase64);

			String folder = "PC_Store/" + fileType;
			S3FileUploadService.UploadResult result = s3Service.upload(fileBytes, folder, mimeType);

			try {
				uploadedFileRepository.save(UploadedFile.builder()
						.url(result.url())
						.publicId(result.key())
						.format(result.extension())
						.fileSize(result.fileSize())
						.fileType(fileType)
						.resourceType(isVideo ? "video" : "image")
						.build());
			} catch (Exception dbEx) {
				log.warn("Failed to save file metadata to DB (upload succeeded): {}", dbEx.getMessage());
			}

			return UploadImageResponse.builder()
					.url(result.url())
					.publicId(result.key())
					.fileSize(result.fileSize())
					.format(result.extension())
					.build();

		} catch (ImageValidationException e) {
			throw e;
		} catch (Exception e) {
			log.error("S3 upload failed: ", e);
			throw new FileUploadException("Failed to upload file: " + e.getMessage(), e);
		}
	}

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

	public void deleteImage(String key) {
		log.info("Deleting file from S3: {}", key);
		try {
			s3Service.delete(key);
			log.info("File deleted from S3 successfully: {}", key);
		} catch (Exception e) {
			log.error("S3 delete failed: ", e);
			throw new FileUploadException("Failed to delete file: " + e.getMessage(), e);
		}
	}

	private String extractMimeType(String base64Data) {
		if (base64Data != null && base64Data.startsWith("data:")) {
			int semicolonIdx = base64Data.indexOf(';');
			if (semicolonIdx > 5) {
				return base64Data.substring(5, semicolonIdx);
			}
		}
		return "application/octet-stream";
	}

	private String extractBase64Content(String base64Data) {
		if (base64Data.startsWith("data:")) {
			int commaIndex = base64Data.indexOf(',');
			if (commaIndex >= 0) {
				return base64Data.substring(commaIndex + 1);
			}
			throw new InvalidImageFormatException("Invalid base64 data format");
		}
		return base64Data;
	}

	private boolean isVideoContent(String base64Data) {
		return base64Data != null && base64Data.startsWith("data:video");
	}
}
