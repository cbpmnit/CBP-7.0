package com.cbp7.notification.service;

import com.cbp7.notification.dto.request.SendTestEmailRequest;
import com.cbp7.notification.entity.NotificationType;

import java.util.Map;
import java.util.UUID;

public interface EmailNotificationService {
    void sendTemplateEmail(UUID templateId, String recipient, Map<String, String> variables);
    void sendTemplateEmailByType(NotificationType type, String recipient, Map<String, String> variables);
    boolean sendTestEmail(SendTestEmailRequest request);
}
