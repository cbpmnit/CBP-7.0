package com.cbp7.notification.service;

import com.cbp7.admin.student.dto.AdminStudentListItemResponse;
import com.cbp7.admin.student.service.AdminStudentManagementService;
import com.cbp7.auth.entity.User;
import com.cbp7.auth.repository.UserRepository;
import com.cbp7.common.exception.ResourceNotFoundException;
import com.cbp7.notification.dto.CreateEmailOperationRequest;
import com.cbp7.notification.dto.EmailLogDto;
import com.cbp7.notification.dto.EmailOperationDto;
import com.cbp7.notification.email.EmailSender;
import com.cbp7.notification.entity.EmailLog;
import com.cbp7.notification.entity.EmailOperation;
import com.cbp7.notification.entity.NotificationTemplate;
import com.cbp7.notification.processor.TemplateProcessorService;
import com.cbp7.notification.repository.EmailLogRepository;
import com.cbp7.notification.repository.EmailOperationRepository;
import com.cbp7.notification.repository.NotificationTemplateRepository;
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
public class EmailOperationService {

    private final EmailOperationRepository emailOperationRepository;
    private final EmailLogRepository emailLogRepository;
    private final NotificationTemplateRepository notificationTemplateRepository;
    private final AdminStudentManagementService studentManagementService;
    private final TemplateProcessorService templateProcessorService;
    private final EmailSender emailSender;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<EmailOperationDto> getAllOperations() {
        return emailOperationRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(EmailOperationDto::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public EmailOperationDto getOperationById(UUID id) {
        EmailOperation op = emailOperationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Email operation not found with id: " + id));
        return EmailOperationDto.fromEntity(op);
    }

    @Transactional(readOnly = true)
    public Page<EmailLogDto> getDeliveryLogs(Pageable pageable) {
        return emailLogRepository.findAllByOrderBySentAtDesc(pageable)
                .map(EmailLogDto::fromEntity);
    }

    @Transactional(readOnly = true)
    public List<EmailLogDto> getLogsByOperationId(UUID operationId) {
        return emailLogRepository.findByOperationId(operationId)
                .stream()
                .map(EmailLogDto::fromEntity)
                .toList();
    }

    @Transactional
    public EmailOperationDto executeOperation(CreateEmailOperationRequest request, String adminStudentId) {
        log.info("Executing Email Operation: '{}' with recipientType: {}", request.name(), request.recipientType());

        NotificationTemplate template = notificationTemplateRepository.findById(request.templateId())
                .orElseThrow(() -> new ResourceNotFoundException("Template not found with id: " + request.templateId()));

        List<String> targetRecipients = resolveRecipients(request);

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
            // Enrich with recipient email
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
        return EmailOperationDto.fromEntity(updated);
    }

    private List<String> resolveRecipients(CreateEmailOperationRequest request) {
        String rType = request.recipientType() != null ? request.recipientType().toUpperCase() : "INDIVIDUAL";

        if ("INDIVIDUAL".equals(rType)) {
            return request.individualRecipients() != null ? request.individualRecipients() : List.of();
        }

        if ("PAID_STUDENTS".equals(rType)) {
            Page<AdminStudentListItemResponse> paid = studentManagementService.getStudentsPaginated(
                    null, null, "SUCCESS", null, null, Pageable.unpaged()
            );
            return paid.getContent().stream()
                    .map(AdminStudentListItemResponse::email)
                    .filter(e -> e != null && !e.isBlank())
                    .distinct()
                    .toList();
        }

        if ("ALL_STUDENTS".equals(rType)) {
            return userRepository.findAll().stream()
                    .map(User::getEmail)
                    .filter(e -> e != null && !e.isBlank())
                    .distinct()
                    .toList();
        }

        if ("CUSTOM_FILTER".equals(rType)) {
            // Apply search or branch filters
            Page<AdminStudentListItemResponse> filtered = studentManagementService.getStudentsPaginated(
                    request.filters(), null, null, null, null, Pageable.unpaged()
            );
            return filtered.getContent().stream()
                    .map(AdminStudentListItemResponse::email)
                    .filter(e -> e != null && !e.isBlank())
                    .distinct()
                    .toList();
        }

        return List.of();
    }

    @Transactional(readOnly = true)
    public byte[] exportEmailLogsCsv() {
        List<EmailLog> allLogs = emailLogRepository.findAll();
        List<String> headers = List.of(
                "Log ID", "Operation ID", "Recipient", "Template Name",
                "Status", "Dispatched At", "Error / Detail"
        );

        List<List<String>> rows = new java.util.ArrayList<>();
        for (EmailLog log : allLogs) {
            rows.add(List.of(
                    log.getId() != null ? log.getId().toString() : "",
                    log.getOperationId() != null ? log.getOperationId().toString() : "",
                    log.getRecipient() != null ? log.getRecipient() : "",
                    log.getTemplateName() != null ? log.getTemplateName() : "",
                    log.getStatus() != null ? log.getStatus() : "",
                    log.getCreatedAt() != null ? log.getCreatedAt().toString() : "",
                    log.getErrorMessage() != null ? log.getErrorMessage() : ""
            ));
        }

        return com.cbp7.common.util.CsvExportUtil.generateCsv(headers, rows);
    }
}
