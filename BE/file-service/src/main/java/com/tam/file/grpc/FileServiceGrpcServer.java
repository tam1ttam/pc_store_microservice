package com.tam.file.grpc;

import com.tam.file.service.impl.FileServiceImpl;
import com.tam.proto.file.v1.DeleteImageRequest;
import com.tam.proto.file.v1.DeleteImageResponse;
import com.tam.proto.file.v1.FileServiceGrpc;
import com.tam.proto.file.v1.UploadImageRequest;
import com.tam.proto.file.v1.UploadImageResponse;
import com.tam.proto.file.v1.ValidateImageRequest;
import com.tam.proto.file.v1.ValidateImageResponse;

import io.grpc.Status;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.service.GrpcService;

@GrpcService
@RequiredArgsConstructor
@Slf4j
public class FileServiceGrpcServer extends FileServiceGrpc.FileServiceImplBase {

    private final FileServiceImpl fileService;

    @Override
    public void uploadImage(UploadImageRequest request, StreamObserver<UploadImageResponse> responseObserver) {
        try {
            var result = fileService.uploadImage(request.getBase64Image(), request.getFileType());
            responseObserver.onNext(UploadImageResponse.newBuilder()
                    .setUrl(result.getUrl())
                    .setPublicId(result.getPublicId())
                    .setFileSize(result.getFileSize())
                    .setFormat(result.getFormat())
                    .build());
            responseObserver.onCompleted();
        } catch (Exception e) {
            log.error("gRPC uploadImage error: {}", e.getMessage());
            responseObserver.onError(Status.INTERNAL.withDescription(e.getMessage()).asRuntimeException());
        }
    }

    @Override
    public void validateImage(ValidateImageRequest request, StreamObserver<ValidateImageResponse> responseObserver) {
        try {
            var result = fileService.validateImage(request.getBase64Image());
            responseObserver.onNext(ValidateImageResponse.newBuilder()
                    .setSafe(result.isSafe())
                    .setMessage(result.getMessage())
                    .build());
            responseObserver.onCompleted();
        } catch (Exception e) {
            log.error("gRPC validateImage error: {}", e.getMessage());
            responseObserver.onError(Status.INTERNAL.withDescription(e.getMessage()).asRuntimeException());
        }
    }

    @Override
    public void deleteImage(DeleteImageRequest request, StreamObserver<DeleteImageResponse> responseObserver) {
        try {
            fileService.deleteImage(request.getPublicId());
            responseObserver.onNext(DeleteImageResponse.newBuilder().setDeleted(true).build());
            responseObserver.onCompleted();
        } catch (Exception e) {
            log.error("gRPC deleteImage error: {}", e.getMessage());
            responseObserver.onError(Status.INTERNAL.withDescription(e.getMessage()).asRuntimeException());
        }
    }
}
