package com.cbp7.notification.dto.request;

import com.cbp7.notification.entity.NotificationChannel;
import com.cbp7.notification.entity.NotificationType;

public record UpdateNotificationTemplateRequest(
        String name,

        NotificationChannel channel,

        NotificationType type,

        String eventType,

        String subject,

        String content,

        String variables,

        String designJson,

        String status
) {
    public UpdateNotificationTemplateRequest(
            String name,
            NotificationChannel channel,
            NotificationType type,
            String subject,
            String content,
            String variables
    ) {
        this(name, channel, type, null, subject, content, variables, null, null);
    }
}
