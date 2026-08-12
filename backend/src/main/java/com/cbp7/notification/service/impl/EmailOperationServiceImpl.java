package com.cbp7.notification.service.impl;

import com.cbp7.common.exception.ResourceNotFoundException;
import com.cbp7.notification.dto.request.CreateEmailOperationRequest;
import com.cbp7.notification.dto.response.EmailLogDto;
import com.cbp7.notification.dto.response.EmailOperationDto;
import com.cbp7.notification.email.EmailSender;
import com.cbp7.notification.entity.EmailLog;
import com.cbp7.notification.entity.EmailOperation;
import com.cbp7.notification.entity.NotificationTemplate;
import com.cbp7.notification.helper.EmailLogCsvExporter;
import com.cbp7.notification.mapper.NotificationMapper;
import com.cbp7.notification.processor.TemplateProcessorService;
import com.cbp7.notification.repository.EmailLogRepository;
import com.cbp7.notification.repository.EmailOperationRepository;
import com.cbp7.notification.repository.NotificationTemplateRepository;
import com.cbp7.notification.resolver.EmailRecipientResolver;
import com.cbp7.notification.service.EmailOperationService;
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

        NotificationTemplate template = notificationTemplateRepository.findById(request.templateId())
                .orElseThrow(() -> new ResourceNotFoundException("Template not found with id: " + request.templateId()));

        List<String> targetRecipients = recipientResolver.resolveRecipients(request);

        EmailOperation operation = EmailOperation.builder()
                .name(request.name())
                .templateId(request.templateId())
                .recipientType(request.recipientType())
                .filters(request.filters())
                .status("IN_PROGRESS")
                .triggerType(request.triggerType() != null ? request.triggerType() : "MANUAL")
                .totalRecipients(targetRecipients.size())
                .sentCount(0)
                .failedCount(0)
                .scheduledAt(request.scheduledAt())
                .executedAt(LocalDateTime.now())
                .createdBy(adminStudentId != null ? adminStudentId : "SYSTEM")
                .build();

        operation = emailOperationRepository.save(operation);

        int sent = 0;
        int failed = 0;

        Map<String, String> baseVars = request.sampleData() != null ? new HashMap<>(request.sampleData()) : new HashMap<>();

        for (String recipientEmail : targetRecipients) {
            Map<String, String> studentVars = new HashMap<>(baseVars);
            studentVars.put("email", recipientEmail);

            try {
                String processedSubject = templateProcessorService.processTemplate(template.getSubject(), studentVars);
                String processedBody = templateProcessorService.processTemplate(template.getContent(), studentVars);

                emailSender.sendEmail(recipientEmail, processedSubject, processedBody);

                emailLogRepository.save(EmailLog.builder()
                        .operationId(operation.getId())
                        .templateId(template.getId())
                        .templateName(template.getName())
                        .recipient(recipientEmail)
                        .status("SENT")
                        .sentAt(LocalDateTime.now())
                        .build());

                sent++;
            } catch (Exception e) {
                log.error("Failed to send email to {}", recipientEmail, e);
                emailLogRepository.save(EmailLog.builder()
                        .operationId(operation.getId())
                        .templateId(template.getId())
                        .templateName(template.getName())
                        .recipient(recipientEmail)
                        .status("FAILED")
                        .errorMessage(e.getMessage() != null ? e.getMessage() : "Unknown delivery failure")
                        .sentAt(LocalDateTime.now())
                        .build());
                failed++;
            }
        }

        operation.setStatus(failed == 0 ? "COMPLETED" : (sent == 0 ? "FAILED" : "COMPLETED_WITH_ERRORS"));
        operation.setSentCount(sent);
        operation.setFailedCount(failed);

        EmailOperation updated = emailOperationRepository.save(operation);
        return notificationMapper.toOperationDto(updated);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportEmailLogsCsv() {
        List<EmailLog> allLogs = emailLogRepository.findAll();
        return csvExporter.exportEmailLogsCsv(allLogs);
    }
}
