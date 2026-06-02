package com.tam.file.service;

import java.util.Map;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import lombok.extern.slf4j.Slf4j;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

@Service
@Slf4j
public class S3FileUploadService {

	private static final Map<String, String> MIME_TO_EXT = Map.of(
			"image/jpeg",
			"jpg",
			"image/jpg",
			"jpg",
			"image/png",
			"png",
			"image/gif",
			"gif",
			"image/webp",
			"webp",
			"video/mp4",
			"mp4",
			"video/webm",
			"webm",
			"video/quicktime",
			"mov");

	private final S3Client s3Client;
	private final String bucket;
	private final String region;

	public S3FileUploadService(
			S3Client s3Client,
			@Value("${spring.cloud.aws.s3.bucket:}") String bucket,
			@Value("${spring.cloud.aws.region.static:ap-southeast-1}") String region) {
		this.s3Client = s3Client;
		this.bucket = bucket;
		this.region = region;
	}

	public record UploadResult(String url, String key, long fileSize, String extension) {}

	public UploadResult upload(byte[] data, String folder, String mimeType) {
		if (bucket == null || bucket.isBlank()) {
			throw new IllegalStateException("S3 bucket name is not configured (spring.cloud.aws.s3.bucket)");
		}

		String ext = MIME_TO_EXT.getOrDefault(mimeType, "bin");
		String key = folder + "/" + UUID.randomUUID() + "." + ext;

		s3Client.putObject(
				PutObjectRequest.builder()
						.bucket(bucket)
						.key(key)
						.contentType(mimeType)
						.contentLength((long) data.length)
						.build(),
				RequestBody.fromBytes(data));

		String url = "https://" + bucket + ".s3." + region + ".amazonaws.com/" + key;
		log.info("Uploaded to S3: {}", url);
		return new UploadResult(url, key, data.length, ext);
	}

	public void delete(String key) {
		if (bucket == null || bucket.isBlank()) {
			log.warn("S3 bucket not configured, skipping delete for key: {}", key);
			return;
		}
		s3Client.deleteObject(DeleteObjectRequest.builder()
				.bucket(bucket)
				.key(key)
				.build());
		log.info("Deleted from S3: {}", key);
	}
}
