package com.tam.product.grpc;

import java.util.concurrent.TimeUnit;

import org.springframework.stereotype.Component;

import com.tam.proto.file.v1.FileServiceGrpc;
import com.tam.proto.file.v1.UploadImageRequest;
import com.tam.proto.file.v1.UploadImageResponse;

import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.client.inject.GrpcClient;

@Component
@Slf4j
public class FileServiceGrpcClient {

    @GrpcClient("file-service")
    private FileServiceGrpc.FileServiceBlockingStub fileServiceStub;

    public String uploadFile(String base64Data, String fileType) {
        try {
            UploadImageResponse response = fileServiceStub
                    .withDeadlineAfter(10, TimeUnit.SECONDS)
                    .uploadImage(UploadImageRequest.newBuilder()
                            .setBase64Image(base64Data)
                            .setFileType(fileType)
                            .build());
            log.info("gRPC upload success, url: {}", response.getUrl());
            return response.getUrl();
        } catch (Exception e) {
            log.error("gRPC uploadFile failed: {}", e.getMessage());
            throw new RuntimeException("FILE_UPLOAD_FAILED: " + e.getMessage(), e);
        }
    }
}
