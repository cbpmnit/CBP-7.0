package com.cbp7.platform.notification.service.impl;

import com.cbp7.common.exception.ResourceNotFoundException;
import com.cbp7.platform.notification.dto.request.CreateEmailOperationRequest;
import com.cbp7.platform.notification.dto.response.EmailLogDto;
import com.cbp7.platform.notification.dto.response.EmailOperationDto;
import com.cbp7.platform.notification.email.EmailSender;
import com.cbp7.platform.notification.entity.EmailLog;
import com.cbp7.platform.notification.entity.EmailOperation;
import com.cbp7.platform.notification.entity.NotificationTemplate;
import com.cbp7.platform.notification.EmailLogCsvExporter;
import com.cbp7.platform.notification.NotificationMapper;
import com.cbp7.platform.notification.processor.TemplateProcessorService;
import com.cbp7.platform.notification.repository.EmailLogRepository;
import com.cbp7.platform.notification.repository.EmailOperationRepository;
import com.cbp7.platform.notification.repository.NotificationTemplateRepository;
import com.cbp7.platform.notification.EmailRecipientResolver;
import com.cbp7.platform.notification.service.EmailOperationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailOperationServiceImpl implements EmailOperationService {

    private final EmailOperationRepository emailOperationRepository;
    private final EmailLogRepository emailLogRepository;
    private final NotificationTemplateRepository notificationTemplateRepository;
    private final TemplateProcessorService templateProcessorService;
    private final EmailSender emailSender;
    private final NotificationMapper notificationMapper;
    private final EmailRecipientResolver recipientResolver;
    private final EmailLogCsvExporter csvExporter;

    @Override
    @Transactional(readOnly = true)
    public List<EmailOperationDto> getAllOperations() {
        return emailOperationRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(notificationMapper::toOperationDto)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public EmailOperationDto getOperationById(UUID id) {
        EmailOperation op = emailOperationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Email operation not found with id: " + id));
        return notificationMapper.toOperationDto(op);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<EmailLogDto> getDeliveryLogs(Pageable pageable) {
        return emailLogRepository.findAllByOrderBySentAtDesc(pageable)
                .map(notificationMapper::toEmailLogDto);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EmailLogDto> getLogsByOperationId(UUID operationId) {
        return emailLogRepository.findByOperationId(operationId)
                .stream()
                .map(notificationMapper::toEmailLogDto)
                .toList();
    }

    @Override
    @Transactional
    public EmailOperationDto executeOperation(CreateEmailOperationRequest request, String adminStudentId) {
        log.info("Executing Email Operation: '{}' with recipientType: {}", request.name(), request.recipientType());

        NotificationTemplate template = fetchTemplateById(request.templateId());
        List<String> targetRecipients = recipientResolver.resolveRecipients(request);

        EmailOperation operation = initializeOperation(request, targetRecipients.size(), adminStudentId);
        operation = emailOperationRepository.save(operation);

        DispatchResult result = dispatchEmailsToRecipients(operation, template, targetRecipients, request.sampleData());

        operation.setStatus(determineFinalStatus(result.sentCount(), result.failedCount()));
        operation.setSentCount(result.sentCount());
        operation.setFailedCount(result.failedCount());

        EmailOperation updated = emailOperationRepository.save(operation);
        
        return notificationMapper.toOperationDto(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportEmailLogsCsv() {
        List<EmailLog> allLogs = emailLogRepository.findAll();
        return csvExporter.exportEmailLogsCsv(allLogs);
    }

    // --- Private Story Helper Methods ---

    private NotificationTemplate fetchTemplateById(UUID templateId) {
        return notificationTemplateRepository.findById(templateId)
                .orElseThrow(() -> new ResourceNotFoundException("Template not found with id: " + templateId));
    }

    private EmailOperation initializeOperation(CreateEmailOperationRequest request, int totalRecipients, String adminStudentId) {
        return EmailOperation.builder()
                .name(request.name())
                .templateId(request.templateId())
                .recipientType(request.recipientType())
                .filters(request.filters())
                .status("IN_PROGRESS")
                .triggerType(request.triggerType() != null ? request.triggerType() : "MANUAL")
                .totalRecipients(totalRecipients)
                .sentCount(0)
                .failedCount(0)
                .scheduledAt(request.scheduledAt())
                .executedAt(LocalDateTime.now())
                .createdBy(adminStudentId != null ? adminStudentId : "SYSTEM")
                .build();
    }

    private DispatchResult dispatchEmailsToRecipients(
            EmailOperation operation, NotificationTemplate template, List<String> targetRecipients, Map<String, String> sampleData
    ) {
        int sent = 0;
        int failed = 0;
        Map<String, String> baseVars = sampleData != null ? new HashMap<>(sampleData) : new HashMap<>();

        for (String recipientEmail : targetRecipients) {
            boolean success = dispatchSingleEmail(operation, template, recipientEmail, baseVars);
            if (success) {
                sent++;
            } else {
                failed++;
            }
        }
        return new DispatchResult(sent, failed);
    }

    private boolean dispatchSingleEmail(
            EmailOperation operation, NotificationTemplate template, String recipientEmail, Map<String, String> baseVars
    ) {
        Map<String, String> studentVars = new HashMap<>(baseVars);
        studentVars.put("email", recipientEmail);

        try {
            String processedSubject = templateProcessorService.processTemplate(template.getSubject(), studentVars);
            String processedBody = templateProcessorService.processTemplate(template.getContent(), studentVars);

            emailSender.sendEmail(recipientEmail, processedSubject, processedBody);
            logEmailDelivery(operation.getId(), template, recipientEmail, "SENT", null);
            return true;
        } catch (Exception e) {
            log.error("Failed to send email to {}", recipientEmail, e);
            String errorMessage = e.getMessage() != null ? e.getMessage() : "Unknown delivery failure";
            logEmailDelivery(operation.getId(), template, recipientEmail, "FAILED", errorMessage);
            return false;
        }
    }

    private void logEmailDelivery(UUID operationId, NotificationTemplate template, String recipient, String status, String errorMessage) {
        EmailLog logEntry = EmailLog.builder()
                .operationId(operationId)
                .templateId(template.getId())
                .templateName(template.getName())
                .recipient(recipient)
                .status(status)
                .errorMessage(errorMessage)
                .sentAt(LocalDateTime.now())
                .build();
        emailLogRepository.save(logEntry);
    }

    private String determineFinalStatus(int sentCount, int failedCount) {
        if (failedCount == 0) {
            return "COMPLETED";
        }
        if (sentCount == 0) {
            return "FAILED";
        }
        return "COMPLETED_WITH_ERRORS";
    }

    private record DispatchResult(int sentCount, int failedCount) {}
}
