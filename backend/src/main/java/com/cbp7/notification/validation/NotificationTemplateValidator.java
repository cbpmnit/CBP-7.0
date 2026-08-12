package com.cbp7.notification.validation;

import com.cbp7.notification.dto.request.CreateNotificationTemplateRequest;
import com.cbp7.notification.dto.request.UpdateNotificationTemplateRequest;
import org.springframework.stereotype.Component;

@Component
public class NotificationTemplateValidator {

    public void validateCreateTemplate(CreateNotificationTemplateRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Create template request cannot be null");
        }
        if (request.name() == null || request.name().isBlank()) {
            throw new IllegalArgumentException("Template name is required");
        }
        if (request.content() == null || request.content().isBlank()) {
            throw new IllegalArgumentException("Template content is required");
        }
    }

    public void validateUpdateTemplate(UpdateNotificationTemplateRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Update template request cannot be null");
        }
    }
}
