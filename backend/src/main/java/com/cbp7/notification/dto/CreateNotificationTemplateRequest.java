package com.cbp7.notification.dto;

import com.cbp7.notification.entity.NotificationChannel;
import com.cbp7.notification.entity.NotificationType;
import jakarta.validation.constraints.NotBlank;

public record CreateNotificationTemplateRequest(
        @NotBlank(message = "Name is required")
        String name,

        @jakarta.validation.constraints.NotNull(message = "Channel is required")
        NotificationChannel channel,

        @jakarta.validation.constraints.NotNull(message = "Notification type is required")
        NotificationType type,

        String eventType,

        String subject,

        @NotBlank(message = "Content is required")
        String content,

        String variables,

        String designJson,

        String status
) {
    public CreateNotificationTemplateRequest(
            String name,
            NotificationChannel channel,
            NotificationType type,
            String subject,
            String content,
            String variables
    ) {
        this(name, channel, type, null, subject, content, variables, null, "DRAFT");
    }
}
