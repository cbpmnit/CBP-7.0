package com.cbp7.notification.service;

import com.cbp7.common.exception.ResourceNotFoundException;
import com.cbp7.notification.email.EmailSender;
import com.cbp7.notification.entity.NotificationTemplate;
import com.cbp7.notification.entity.NotificationType;
import com.cbp7.notification.processor.TemplateProcessorService;
import com.cbp7.notification.repository.NotificationTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EmailNotificationService {

    private final NotificationTemplateRepository notificationTemplateRepository;
    private final TemplateProcessorService templateProcessorService;
    private final EmailSender emailSender;

    @Transactional(readOnly = true)
    public void sendTemplateEmail(UUID templateId, String recipient, Map<String, String> variables) {
        NotificationTemplate template = notificationTemplateRepository.findById(templateId)
                .orElseThrow(() -> new ResourceNotFoundException("Notification template not found with id: " + templateId));

        sendEmailForTemplate(template, recipient, variables);
    }

    @Transactional(readOnly = true)
    public void sendTemplateEmailByType(NotificationType type, String recipient, Map<String, String> variables) {
        NotificationTemplate template = notificationTemplateRepository.findByType(type)
                .orElseThrow(() -> new ResourceNotFoundException("Notification template not found with type: " + type));

        sendEmailForTemplate(template, recipient, variables);
    }

    private void sendEmailForTemplate(NotificationTemplate template, String recipient, Map<String, String> variables) {
        String processedSubject = templateProcessorService.processTemplate(template.getSubject(), variables);
        String processedBody = templateProcessorService.processTemplate(template.getContent(), variables);

        emailSender.sendEmail(recipient, processedSubject, processedBody);
    }
}
