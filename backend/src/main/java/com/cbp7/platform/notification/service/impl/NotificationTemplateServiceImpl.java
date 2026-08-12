package com.cbp7.platform.notification.service.impl;

import com.cbp7.common.exception.ResourceNotFoundException;
import com.cbp7.platform.notification.dto.common.EmailVariableDto;
import com.cbp7.platform.notification.dto.request.CreateNotificationTemplateRequest;
import com.cbp7.platform.notification.dto.request.UpdateNotificationTemplateRequest;
import com.cbp7.platform.notification.dto.response.NotificationTemplateResponse;
import com.cbp7.platform.notification.entity.NotificationChannel;
import com.cbp7.platform.notification.entity.NotificationTemplate;
import com.cbp7.platform.notification.entity.NotificationType;
import com.cbp7.platform.notification.NotificationMapper;
import com.cbp7.platform.notification.repository.NotificationTemplateRepository;
import com.cbp7.platform.notification.service.NotificationTemplateService;
import com.cbp7.platform.notification.NotificationTemplateValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationTemplateServiceImpl implements NotificationTemplateService {

    private final NotificationTemplateRepository notificationTemplateRepository;
    private final NotificationTemplateValidator templateValidator;
    private final NotificationMapper notificationMapper;

    @Override
    @Transactional
    public NotificationTemplateResponse createTemplate(CreateNotificationTemplateRequest request, String adminStudentId) {
        templateValidator.validateCreateTemplate(request);

        NotificationChannel channel = request.channel() != null ? request.channel() : NotificationChannel.EMAIL;
        NotificationType type = request.type() != null ? request.type() : NotificationType.ATTENDANCE_QR_GENERATED;

        NotificationTemplate template = NotificationTemplate.builder()
                .name(request.name())
                .channel(channel)
                .type(type)
                .eventType(request.eventType())
                .subject(request.subject())
                .content(request.content())
                .variables(request.variables())
                .designJson(request.designJson())
                .status(request.status() != null ? request.status() : "DRAFT")
                .createdBy(adminStudentId != null ? adminStudentId : "SYSTEM")
                .build();

        NotificationTemplate saved = notificationTemplateRepository.save(template);
        return notificationMapper.toTemplateResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationTemplateResponse> getAllTemplates() {
        return notificationTemplateRepository.findAll()
                .stream()
                .map(notificationMapper::toTemplateResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public NotificationTemplateResponse getTemplateById(UUID id) {
        NotificationTemplate template = notificationTemplateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Email template not found with id: " + id));
        return notificationMapper.toTemplateResponse(template);
    }

    @Override
    @Transactional
    public NotificationTemplateResponse updateTemplate(UUID id, UpdateNotificationTemplateRequest request) {
        templateValidator.validateUpdateTemplate(request);

        NotificationTemplate template = notificationTemplateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Email template not found with id: " + id));

        if (request.name() != null) template.setName(request.name());
        if (request.channel() != null) template.setChannel(request.channel());
        if (request.type() != null) template.setType(request.type());
        if (request.eventType() != null) template.setEventType(request.eventType());
        if (request.subject() != null) template.setSubject(request.subject());
        if (request.content() != null) template.setContent(request.content());
        if (request.variables() != null) template.setVariables(request.variables());
        if (request.designJson() != null) template.setDesignJson(request.designJson());
        if (request.status() != null) template.setStatus(request.status());

        NotificationTemplate updated = notificationTemplateRepository.save(template);
        return notificationMapper.toTemplateResponse(updated);
    }

    @Override
    @Transactional
    public NotificationTemplateResponse publishTemplate(UUID id) {
        NotificationTemplate template = notificationTemplateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Email template not found with id: " + id));

        if (template.getName() == null || template.getName().isBlank()) {
            throw new IllegalArgumentException("Template name is required to publish");
        }
        if (template.getSubject() == null || template.getSubject().isBlank()) {
            throw new IllegalArgumentException("Email subject line is required to publish");
        }
        if (template.getContent() == null || template.getContent().isBlank()) {
            throw new IllegalArgumentException("Email HTML content is required to publish");
        }

        template.setStatus("PUBLISHED");
        template.setPublishedAt(LocalDateTime.now());

        NotificationTemplate published = notificationTemplateRepository.save(template);
        return notificationMapper.toTemplateResponse(published);
    }

    @Override
    @Transactional
    public NotificationTemplateResponse archiveTemplate(UUID id) {
        NotificationTemplate template = notificationTemplateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Email template not found with id: " + id));

        template.setStatus("ARCHIVED");
        NotificationTemplate archived = notificationTemplateRepository.save(template);
        return notificationMapper.toTemplateResponse(archived);
    }

    @Override
    @Transactional
    public NotificationTemplateResponse duplicateTemplate(UUID id, String adminStudentId) {
        NotificationTemplate original = notificationTemplateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Email template not found with id: " + id));

        NotificationTemplate copy = NotificationTemplate.builder()
                .name(original.getName() + " (Copy)")
                .channel(original.getChannel())
                .type(original.getType())
                .eventType(original.getEventType())
                .subject(original.getSubject())
                .content(original.getContent())
                .variables(original.getVariables())
                .designJson(original.getDesignJson())
                .status("DRAFT")
                .createdBy(adminStudentId != null ? adminStudentId : original.getCreatedBy())
                .build();

        NotificationTemplate savedCopy = notificationTemplateRepository.save(copy);
        return notificationMapper.toTemplateResponse(savedCopy);
    }

    @Override
    @Transactional
    public void deleteTemplate(UUID id) {
        NotificationTemplate template = notificationTemplateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Email template not found with id: " + id));
        notificationTemplateRepository.delete(template);
    }

    @Override
    public List<EmailVariableDto> getVariablesRegistry() {
        return List.of(
                new EmailVariableDto("studentName", "Student Name", "STUDENT", "Full registered name of the participant", "Parv Agrawal", "TEXT"),
                new EmailVariableDto("studentId", "Student ID", "STUDENT", "Official institutional roll number / student ID", "2024UCH1198", "TEXT"),
                new EmailVariableDto("email", "Email Address", "STUDENT", "Registered email address", "parvagrawal@mnit.ac.in", "TEXT"),
                new EmailVariableDto("phoneNumber", "Phone Number", "STUDENT", "Contact phone number", "+91 98765 43210", "TEXT"),
                new EmailVariableDto("amount", "Fee Amount", "PAYMENT", "Registration fee paid in INR", "500.00", "NUMBER"),
                new EmailVariableDto("transactionId", "PhonePe Transaction ID", "PAYMENT", "Gateway payment reference transaction ID", "TXN_CBP_982410492", "TEXT"),
                new EmailVariableDto("paidAt", "Payment Date", "PAYMENT", "Date and time of payment verification", "09 August 2026, 14:30 IST", "DATE"),
                new EmailVariableDto("paymentStatus", "Payment Status", "PAYMENT", "Verification status", "SUCCESS", "TEXT"),
                new EmailVariableDto("sessionName", "Session Name", "ATTENDANCE", "Title of workshop session", "Day 1: Leadership & Communication Skills", "TEXT"),
                new EmailVariableDto("sessionDate", "Session Date", "ATTENDANCE", "Scheduled date of workshop session", "Monday, 10 August 2026", "DATE"),
                new EmailVariableDto("venue", "Venue Location", "ATTENDANCE", "Auditorium or hall venue", "VLTC Main Auditorium, MNIT Jaipur", "TEXT"),
                new EmailVariableDto("qrCode", "Dynamic Gate QR Pass", "ATTENDANCE", "Encrypted HMAC QR pass image for entry gate scanning", "https://cbp.mnit.ac.in/api/v1/qr/sample-pass.png", "IMAGE"),
                new EmailVariableDto("certificateUrl", "Certificate Download Link", "CERTIFICATE", "Direct URL to download verified PDF credential", "https://cbp.mnit.ac.in/certificate/download/CBP-2026-8841", "URL"),
                new EmailVariableDto("certificateNumber", "Certificate Credential ID", "CERTIFICATE", "Unique SHA-256 verified credential serial number", "CBP-2026-8841-MNIT", "TEXT"),
                new EmailVariableDto("issueDate", "Issue Date", "CERTIFICATE", "Official credential issuance date", "15 August 2026", "DATE")
        );
    }
}
