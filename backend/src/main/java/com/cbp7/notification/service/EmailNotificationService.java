package com.cbp7.notification.service;

import com.cbp7.admin.student.dto.AdminStudentListItemResponse;
import com.cbp7.admin.student.service.AdminStudentManagementService;
import com.cbp7.common.exception.ResourceNotFoundException;
import com.cbp7.notification.dto.SendTestEmailRequest;
import com.cbp7.notification.email.EmailSender;
import com.cbp7.notification.entity.NotificationChannel;
import com.cbp7.notification.entity.NotificationTemplate;
import com.cbp7.notification.entity.NotificationType;
import com.cbp7.notification.processor.TemplateProcessorService;
import com.cbp7.notification.repository.NotificationTemplateRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailNotificationService {

    private final NotificationTemplateRepository notificationTemplateRepository;
    private final TemplateProcessorService templateProcessorService;
    private final EmailSender emailSender;
    private final AdminStudentManagementService studentManagementService;

    @Transactional(readOnly = true)
    public void sendTemplateEmail(UUID templateId, String recipient, Map<String, String> variables) {
        NotificationTemplate template = notificationTemplateRepository.findById(templateId)
                .orElseThrow(() -> new ResourceNotFoundException("Email template not found with id: " + templateId));

        sendEmailForTemplate(template, recipient, variables);
    }

    @Transactional(readOnly = true)
    public void sendTemplateEmailByType(NotificationType type, String recipient, Map<String, String> variables) {
        NotificationTemplate template = notificationTemplateRepository
                .findByTypeAndChannelAndStatus(type, NotificationChannel.EMAIL, "PUBLISHED")
                .orElseGet(() -> notificationTemplateRepository
                        .findByTypeAndChannel(type, NotificationChannel.EMAIL)
                        .orElseGet(() -> createFallbackTemplate(type)));

        sendEmailForTemplate(template, recipient, variables);
    }

    @Transactional(readOnly = true)
    public boolean sendTestEmail(SendTestEmailRequest request) {
        log.info("Processing test email request for template ID: {}", request.templateId());

        NotificationTemplate template = notificationTemplateRepository.findById(request.templateId())
                .orElseGet(() -> NotificationTemplate.builder()
                        .name("Test Template")
                        .subject("CBP Portal Notification Test")
                        .content("<div style='padding:20px; font-family:sans-serif;'><h2>CBP 7.0 Test Email Notification</h2><p>Dear {{studentName}}, this is a test email notification sent from the Email Builder.</p></div>")
                        .build());

        Map<String, String> testVars = new HashMap<>();
        if (request.sampleData() != null) {
            testVars.putAll(request.sampleData());
        }

        List<String> targetEmails = new ArrayList<>();
        if (Boolean.TRUE.equals(request.sendToAll())) {
            // Strictly fetch ONLY paid students
            Page<AdminStudentListItemResponse> paidStudents = studentManagementService.getStudentsPaginated(
                    null, null, "SUCCESS", null, null, Pageable.unpaged()
            );
            for (AdminStudentListItemResponse s : paidStudents.getContent()) {
                if (s.email() != null && !s.email().isBlank()) {
                    targetEmails.add(s.email());
                }
            }
        } else if (request.recipients() != null && !request.recipients().isEmpty()) {
            targetEmails.addAll(request.recipients());
        } else if (request.recipientEmail() != null && !request.recipientEmail().isBlank()) {
            targetEmails.add(request.recipientEmail());
        } else {
            targetEmails.add("admin@mnit.ac.in");
        }

        log.info("Dispatching test emails to {} paid recipient(s)", targetEmails.size());
        for (String email : targetEmails) {
            sendEmailForTemplate(template, email, testVars);
        }

        return true;
    }

    private NotificationTemplate createFallbackTemplate(NotificationType type) {
        log.warn("Email template not found in database for type: {}, using in-memory fallback template", type);
        return NotificationTemplate.builder()
                .name("Default " + type.name())
                .type(type)
                .channel(NotificationChannel.EMAIL)
                .subject("CBP Portal Notification")
                .content("Hello {{studentName}}, thank you for using CBP Portal. Student ID: {{studentId}}")
                .createdBy("SYSTEM")
                .build();
    }

    private void sendEmailForTemplate(NotificationTemplate template, String recipient, Map<String, String> variables) {
        try {
            String processedSubject = templateProcessorService.processTemplate(template.getSubject(), variables);
            String processedBody = templateProcessorService.processTemplate(template.getContent(), variables);

            emailSender.sendEmail(recipient, processedSubject, processedBody);
            log.info("Email notification successfully dispatched to: {}", recipient);
        } catch (Exception e) {
            log.error("Failed to process and send email notification to: {}", recipient, e);
        }
    }
}
