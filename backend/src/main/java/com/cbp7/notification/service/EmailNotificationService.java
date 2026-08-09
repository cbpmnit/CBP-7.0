package com.cbp7.notification.service;

import com.cbp7.common.exception.ResourceNotFoundException;
import com.cbp7.notification.email.EmailSender;
import com.cbp7.notification.entity.NotificationChannel;
import com.cbp7.notification.entity.NotificationTemplate;
import com.cbp7.notification.entity.NotificationType;
import com.cbp7.notification.processor.TemplateProcessorService;
import com.cbp7.notification.repository.NotificationTemplateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
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
        NotificationTemplate template = notificationTemplateRepository.findByTypeAndChannel(type, NotificationChannel.EMAIL)
                .orElseGet(() -> createFallbackTemplate(type));

        sendEmailForTemplate(template, recipient, variables);
    }

    private NotificationTemplate createFallbackTemplate(NotificationType type) {
        log.warn("Notification template not found in database for type: {}, using in-memory fallback template", type);
        return NotificationTemplate.builder()
                .name("Default " + type.name())
                .type(type)
                .channel(NotificationChannel.EMAIL)
                .subject("CBP Portal Notification")
                .content("Hello {{student_name}}, thank you for using CBP Portal. Student ID: {{student_id}}")
                .createdBy("SYSTEM")
                .build();
    }

    private void sendEmailForTemplate(NotificationTemplate template, String recipient, Map<String, String> variables) {
        try {
            String processedSubject = templateProcessorService.processTemplate(template.getSubject(), variables);
            String processedBody = templateProcessorService.processTemplate(template.getContent(), variables);

            emailSender.sendEmail(recipient, processedSubject, processedBody);
        } catch (Exception e) {
            log.error("Failed to process and send email notification to: {}", recipient, e);
        }
    }
}
