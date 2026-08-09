package com.cbp7.notification.dto;

import com.cbp7.notification.entity.NotificationChannel;
import com.cbp7.notification.entity.NotificationTemplate;
import com.cbp7.notification.entity.NotificationType;

import java.time.LocalDateTime;
import java.util.UUID;

public record NotificationTemplateResponse(
        UUID id,
        String name,
        String templateName,
        NotificationChannel channel,
        NotificationType type,
        String notificationType,
        String eventType,
        String subject,
        String body,
        String content,
        String variables,
        String designJson,
        String status,
        LocalDateTime publishedAt,
        String createdBy,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static NotificationTemplateResponse fromEntity(NotificationTemplate template) {
        String eventTypeStr = template.getEventType() != null ? template.getEventType()
                : (template.getType() != null ? template.getType().name() : "ATTENDANCE_QR_GENERATED");
        return new NotificationTemplateResponse(
                template.getId(),
                template.getName(),
                template.getName(),
                template.getChannel() != null ? template.getChannel() : NotificationChannel.EMAIL,
                template.getType() != null ? template.getType() : NotificationType.ATTENDANCE_QR_GENERATED,
                eventTypeStr,
                eventTypeStr,
                template.getSubject(),
                template.getContent(),
                template.getContent(),
                template.getVariables(),
                template.getDesignJson(),
                template.getStatus() != null ? template.getStatus() : "DRAFT",
                template.getPublishedAt(),
                template.getCreatedBy(),
                template.getCreatedAt(),
                template.getUpdatedAt()
        );
    }
}
