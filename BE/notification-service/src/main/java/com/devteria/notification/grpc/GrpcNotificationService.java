package com.devteria.notification.grpc;

import java.util.List;
import java.util.stream.Collectors;

import com.devteria.notification.dto.response.NotificationResponse;
import com.devteria.notification.service.NotificationService;
import com.tam.proto.notification.v1.*;

import io.grpc.Status;
import io.grpc.stub.StreamObserver;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import net.devh.boot.grpc.server.service.GrpcService;

@Slf4j
@GrpcService
@RequiredArgsConstructor
public class GrpcNotificationService extends NotificationServiceGrpc.NotificationServiceImplBase {

    private final NotificationService notificationService;

    @Override
    public void createNotification(
            CreateNotificationRequest request, StreamObserver<CreateNotificationResponse> responseObserver) {
        try {
            NotificationResponse resp = notificationService.create(
                    request.getUserId(),
                    request.getType(),
                    request.getTitle(),
                    request.getBody(),
                    request.getIsSystem(),
                    request.getActionRequired(),
                    request.getReferenceId(),
                    request.getReferenceType());
            responseObserver.onNext(CreateNotificationResponse.newBuilder()
                    .setId(resp.getId())
                    .setSuccess(true)
                    .build());
            responseObserver.onCompleted();
        } catch (Exception e) {
            log.error("gRPC createNotification error", e);
            responseObserver.onError(
                    Status.INTERNAL.withDescription(e.getMessage()).asRuntimeException());
        }
    }

    @Override
    public void getUserNotifications(
            GetUserNotificationsRequest request, StreamObserver<GetUserNotificationsResponse> responseObserver) {
        try {
            List<NotificationResponse> list =
                    notificationService.getByUserId(request.getUserId(), request.getUnreadOnly());
            long unread = notificationService.countUnread(request.getUserId());

            List<NotificationItem> items = list.stream()
                    .map(n -> NotificationItem.newBuilder()
                            .setId(safe(n.getId()))
                            .setUserId(safe(n.getUserId()))
                            .setType(safe(n.getType()))
                            .setTitle(safe(n.getTitle()))
                            .setBody(safe(n.getBody()))
                            .setIsRead(n.isRead())
                            .setIsSystem(n.isSystem())
                            .setActionRequired(n.isActionRequired())
                            .setActionDone(n.isActionDone())
                            .setReferenceId(safe(n.getReferenceId()))
                            .setReferenceType(safe(n.getReferenceType()))
                            .setCreatedAt(
                                    n.getCreatedAt() != null ? n.getCreatedAt().toString() : "")
                            .build())
                    .collect(Collectors.toList());

            responseObserver.onNext(GetUserNotificationsResponse.newBuilder()
                    .addAllNotifications(items)
                    .setTotalUnread((int) unread)
                    .build());
            responseObserver.onCompleted();
        } catch (Exception e) {
            log.error("gRPC getUserNotifications error", e);
            responseObserver.onError(
                    Status.INTERNAL.withDescription(e.getMessage()).asRuntimeException());
        }
    }

    @Override
    public void markAsRead(MarkAsReadRequest request, StreamObserver<MarkAsReadResponse> responseObserver) {
        try {
            notificationService.markAsRead(request.getNotificationId(), request.getUserId());
            responseObserver.onNext(
                    MarkAsReadResponse.newBuilder().setSuccess(true).build());
            responseObserver.onCompleted();
        } catch (Exception e) {
            log.error("gRPC markAsRead error", e);
            responseObserver.onError(
                    Status.INTERNAL.withDescription(e.getMessage()).asRuntimeException());
        }
    }

    @Override
    public void getUnreadCount(GetUnreadCountRequest request, StreamObserver<GetUnreadCountResponse> responseObserver) {
        try {
            long count = notificationService.countUnread(request.getUserId());
            responseObserver.onNext(
                    GetUnreadCountResponse.newBuilder().setCount((int) count).build());
            responseObserver.onCompleted();
        } catch (Exception e) {
            log.error("gRPC getUnreadCount error", e);
            responseObserver.onError(
                    Status.INTERNAL.withDescription(e.getMessage()).asRuntimeException());
        }
    }

    private String safe(String value) {
        return value != null ? value : "";
    }
}
