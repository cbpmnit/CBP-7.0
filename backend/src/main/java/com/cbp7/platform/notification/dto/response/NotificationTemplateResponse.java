package com.cbp7.platform.notification.dto.response;

import com.cbp7.platform.notification.entity.NotificationChannel;
import com.cbp7.platform.notification.entity.NotificationType;

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
) {}
