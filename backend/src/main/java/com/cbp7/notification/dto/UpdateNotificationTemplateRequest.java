package com.cbp7.notification.dto;

import com.cbp7.notification.entity.NotificationChannel;
import com.cbp7.notification.entity.NotificationType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UpdateNotificationTemplateRequest(
        @NotBlank(message = "Name is required")
        String name,

        @NotNull(message = "Channel is required")
        NotificationChannel channel,

        @NotNull(message = "Notification type is required")
        NotificationType type,

        String subject,

        @NotBlank(message = "Content is required")
        String content,

        String variables
) {
}
