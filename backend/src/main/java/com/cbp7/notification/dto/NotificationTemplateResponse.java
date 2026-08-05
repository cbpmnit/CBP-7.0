package com.cbp7.notification.dto;

import com.cbp7.notification.entity.NotificationChannel;
import com.cbp7.notification.entity.NotificationTemplate;
import com.cbp7.notification.entity.NotificationType;

import java.time.LocalDateTime;
import java.util.UUID;

public record NotificationTemplateResponse(
        UUID id,
        String name,
        NotificationChannel channel,
        NotificationType type,
        String subject,
        String content,
        String variables,
        String createdBy,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static NotificationTemplateResponse fromEntity(NotificationTemplate template) {
        return new NotificationTemplateResponse(
                template.getId(),
                template.getName(),
                template.getChannel(),
                template.getType(),
                template.getSubject(),
                template.getContent(),
                template.getVariables(),
                template.getCreatedBy(),
                template.getCreatedAt(),
                template.getUpdatedAt()
        );
    }
}
