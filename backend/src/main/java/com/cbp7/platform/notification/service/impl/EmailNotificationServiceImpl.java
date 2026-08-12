package com.cbp7.platform.notification.service.impl;

import com.cbp7.platform.admin.student.dto.response.AdminStudentListItemResponse;
import com.cbp7.platform.admin.student.service.AdminStudentManagementService;
import com.cbp7.common.exception.ResourceNotFoundException;
import com.cbp7.platform.notification.dto.request.SendTestEmailRequest;
import com.cbp7.platform.notification.email.EmailSender;
import com.cbp7.platform.notification.entity.EmailLog;
import com.cbp7.platform.notification.entity.NotificationChannel;
import com.cbp7.platform.notification.entity.NotificationTemplate;
import com.cbp7.platform.notification.entity.NotificationType;
import com.cbp7.platform.notification.processor.TemplateProcessorService;
import com.cbp7.platform.notification.repository.EmailLogRepository;
import com.cbp7.platform.notification.repository.NotificationTemplateRepository;
import com.cbp7.platform.notification.service.EmailNotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailNotificationServiceImpl implements EmailNotificationService {

    private final NotificationTemplateRepository notificationTemplateRepository;
    private final EmailLogRepository emailLogRepository;
    private final TemplateProcessorService templateProcessorService;
    private final EmailSender emailSender;
    private final AdminStudentManagementService studentManagementService;

    @Override
    @Transactional
    public void sendTemplateEmail(UUID templateId, String recipient, Map<String, String> variables) {
        NotificationTemplate template = notificationTemplateRepository.findById(templateId)
                .orElseThrow(() -> new ResourceNotFoundException("Email template not found with id: " + templateId));

        sendEmailForTemplate(template, recipient, variables, template.getEventType());
    }

    @Override
    @Transactional
    public void sendTemplateEmailByType(NotificationType type, String recipient, Map<String, String> variables) {
        sendEventEmail(type != null ? type.name() : "GENERAL_NOTIFICATION", recipient, variables);
    }

    @Override
    @Transactional
    public void sendEventEmail(String eventType, String recipient, Map<String, String> variables) {
        if (recipient == null || recipient.isBlank()) {
            log.warn("Cannot send email: recipient address is null or blank for event {}", eventType);
            return;
        }

        String targetEvent = eventType != null ? eventType.trim().toUpperCase() : "GENERAL_NOTIFICATION";

        // Strictly check for ACTIVE template in DB
        Optional<NotificationTemplate> templateOpt = notificationTemplateRepository
                .findFirstByEventTypeAndChannelAndStatus(targetEvent, NotificationChannel.EMAIL, "ACTIVE");

        if (templateOpt.isEmpty()) {
            try {
                NotificationType nType = NotificationType.valueOf(targetEvent);
                templateOpt = notificationTemplateRepository
                        .findFirstByTypeAndChannelAndStatus(nType, NotificationChannel.EMAIL, "ACTIVE");
            } catch (Exception ignored) {}
        }

        if (templateOpt.isEmpty()) {
            log.warn("Email skipped: No ACTIVE template configured for event {}", targetEvent);
            saveEmailLog(null, targetEvent, "Email skipped: No ACTIVE template", recipient, "SKIPPED_NO_TEMPLATE", "Email skipped: No ACTIVE template configured for event " + targetEvent);
            return;
        }

        sendEmailForTemplate(templateOpt.get(), recipient, variables, targetEvent);
    }

    @Override
    @Transactional
    public boolean sendTestEmail(SendTestEmailRequest request) {
        log.info("Processing test email request for template ID: {}", request.templateId());

        NotificationTemplate template = resolveTestTemplate(request.templateId());
        Map<String, String> testVars = request.sampleData() != null ? new HashMap<>(request.sampleData()) : new HashMap<>();
        List<String> targetEmails = resolveTestTargetEmails(request);

        log.info("Dispatching test emails to {} recipient(s)", targetEmails.size());
        for (String email : targetEmails) {
            sendEmailForTemplate(template, email, testVars, "TEST_EMAIL");
        }

        return true;
    }

    // --- Private Story Helper Methods ---

    private NotificationTemplate resolveTestTemplate(UUID templateId) {
        if (templateId == null) {
            throw new IllegalArgumentException("Template ID is required for test email dispatch");
        }
        return notificationTemplateRepository.findById(templateId)
                .orElseThrow(() -> new ResourceNotFoundException("Email template not found with ID: " + templateId));
    }

    private List<String> resolveTestTargetEmails(SendTestEmailRequest request) {
        List<String> targetEmails = new ArrayList<>();
        if (Boolean.TRUE.equals(request.sendToAll())) {
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
        return targetEmails;
    }

    private void sendEmailForTemplate(NotificationTemplate template, String recipient, Map<String, String> variables, String eventType) {
        String processedSubject = "";
        try {
            processedSubject = templateProcessorService.processTemplate(template.getSubject(), variables);
            String processedBody = templateProcessorService.processTemplate(template.getContent(), variables);

            emailSender.sendEmail(recipient, processedSubject, processedBody);
            log.info("Email notification successfully dispatched to: {} for event {}", recipient, eventType);
            saveEmailLog(template, eventType, processedSubject, recipient, "SENT", null);
        } catch (Exception e) {
            log.error("Failed to process and send email notification to: {} for event {}", recipient, eventType, e);
            saveEmailLog(template, eventType, processedSubject, recipient, "FAILED", e.getMessage());
        }
    }

    private void saveEmailLog(NotificationTemplate template, String eventType, String subject, String recipient, String status, String errorMessage) {
        try {
            EmailLog logEntry = EmailLog.builder()
                    .templateId(template != null ? template.getId() : null)
                    .templateName(template != null ? template.getName() : "No Active Template")
                    .recipient(recipient)
                    .status(status)
                    .errorMessage(errorMessage)
                    .sentAt(LocalDateTime.now())
                    .build();

            emailLogRepository.save(logEntry);
        } catch (Exception e) {
            log.error("Failed to persist email delivery log for recipient {}", recipient, e);
        }
    }
}
