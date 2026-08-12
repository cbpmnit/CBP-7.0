package com.cbp7.program.certificate.service.impl;

import com.cbp7.program.attendance.record.dto.response.StudentAttendanceSummaryResponse;
import com.cbp7.program.attendance.record.service.AttendanceQueryService;
import com.cbp7.identity.auth.entity.User;
import com.cbp7.identity.auth.repository.UserRepository;
import com.cbp7.program.registration.entity.CbpRegistration;
import com.cbp7.program.registration.entity.RegistrationStatus;
import com.cbp7.program.registration.repository.CbpRegistrationRepository;
import com.cbp7.program.certificate.CertificateEligibilityCalculator;
import com.cbp7.program.certificate.dto.common.CertificateTemplateDto;
import com.cbp7.program.certificate.dto.response.CertificateResponse;
import com.cbp7.program.certificate.entity.Certificate;
import com.cbp7.program.certificate.entity.CertificateStatus;
import com.cbp7.program.certificate.entity.CertificateType;
import com.cbp7.program.certificate.generator.PdfCertificateGenerator;
import com.cbp7.program.certificate.CertificateCsvExporter;
import com.cbp7.program.certificate.generator.CertificateNumberGenerator;
import com.cbp7.program.certificate.CertificateMapper;
import com.cbp7.program.certificate.repository.CertificateRepository;
import com.cbp7.program.certificate.service.CertificateService;
import com.cbp7.program.certificate.service.CertificateTemplateService;
import com.cbp7.program.certificate.CertificateValidator;
import com.cbp7.common.exception.ResourceNotFoundException;
import com.cbp7.platform.notification.events.CertificateGeneratedEvent;
import com.cbp7.platform.notification.events.NotificationEventPublisher;
import com.cbp7.payment.entity.PaymentStatus;
import com.cbp7.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class CertificateServiceImpl implements CertificateService {

    private final CertificateRepository certificateRepository;
    private final CbpRegistrationRepository cbpRegistrationRepository;
    private final PaymentRepository paymentRepository;
    private final AttendanceQueryService attendanceQueryService;
    private final UserRepository userRepository;
    private final PdfCertificateGenerator pdfCertificateGenerator;
    private final NotificationEventPublisher notificationEventPublisher;
    private final CertificateTemplateService certificateTemplateService;
    private final CertificateValidator certificateValidator;
    private final CertificateMapper certificateMapper;
    private final CertificateEligibilityCalculator eligibilityCalculator;
    private final CertificateNumberGenerator numberGenerator;
    private final CertificateCsvExporter csvExporter;

    @Value("${certificate.minimum-attendance-percentage:75.0}")
    private double minimumAttendancePercentage;

    @Override
    @Transactional
    public CertificateResponse generateCertificateForStudent(String studentId) {
        if (studentId == null || studentId.isBlank()) {
            throw new IllegalArgumentException("Student ID must not be empty");
        }

        CertificateTemplateDto activeTemplate = certificateTemplateService.getActivePublishedTemplate();

        Optional<Certificate> existingCert = certificateRepository.findByStudentIdAndCertificateType(studentId, CertificateType.PARTICIPATION);
        if (existingCert.isPresent()) {
            Certificate cert = existingCert.get();
            if (cert.getTemplateId() == null && activeTemplate != null) {
                cert.setTemplateId(activeTemplate.id());
                cert = certificateRepository.save(cert);
            }
            return certificateMapper.toCertificateResponse(cert);
        }

        verifyEligibility(studentId);

        User user = userRepository.findByStudentId(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found for student ID: " + studentId));

        Certificate certificate = buildCertificateEntity(studentId, activeTemplate);
        Certificate saved = certificateRepository.save(certificate);
        log.info("Successfully generated certificate {} for student {}", saved.getCertificateNumber(), studentId);

        publishCertificateGeneratedEvent(saved, user.getName(), user.getEmail());
        return certificateMapper.toCertificateResponse(saved);
    }

    @Override
    @Transactional
    public List<CertificateResponse> generateAllEligibleCertificates() {
        List<CbpRegistration> registrations = cbpRegistrationRepository.findAll();
        List<CertificateResponse> generatedList = new ArrayList<>();

        for (CbpRegistration reg : registrations) {
            if (reg.getUser() != null && reg.getUser().getStudentId() != null) {
                String studentId = reg.getUser().getStudentId();
                try {
                    CertificateResponse response = generateCertificateForStudent(studentId);
                    generatedList.add(response);
                } catch (Exception e) {
                    log.warn("Skipping certificate generation for student {}: {}", studentId, e.getMessage());
                }
            }
        }
        return generatedList;
    }

    @Override
    @Transactional(readOnly = true)
    public CertificateResponse getStudentCertificate(String studentId) {
        if (studentId == null || studentId.isBlank()) {
            throw new IllegalArgumentException("Student ID must not be empty");
        }

        Certificate certificate = certificateRepository.findByStudentId(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Certificate not available yet for student: " + studentId));

        return certificateMapper.toCertificateResponse(certificate);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] getStudentCertificatePdfBytes(String studentId) {
        CertificateResponse cert = getStudentCertificate(studentId);
        User user = userRepository.findByStudentId(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found for student ID: " + studentId));

        return pdfCertificateGenerator.generateCertificatePdf(
                user.getName() != null ? user.getName() : studentId,
                studentId,
                cert.certificateNumber(),
                cert.generatedAt() != null ? cert.generatedAt().toLocalDate() : LocalDate.now()
        );
    }

    @Override
    public void verifyEligibility(String studentId) {
        CbpRegistration registration = cbpRegistrationRepository.findByUserStudentIdIgnoreCase(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("CBP registration incomplete or not found for student: " + studentId));

        boolean paymentPaid = (registration.getRegistrationStatus() == RegistrationStatus.REGISTERED)
                || paymentRepository.existsByRegistrationIdAndPaymentStatus(registration.getId(), PaymentStatus.SUCCESS);

        if (!paymentPaid) {
            throw new IllegalStateException("Payment not completed for student: " + studentId);
        }

        StudentAttendanceSummaryResponse summary = attendanceQueryService.getStudentAttendanceSummary(studentId);
        if (!eligibilityCalculator.isEligible(summary.percentage(), true, minimumAttendancePercentage)) {
            throw new IllegalStateException("Attendance percentage (" + summary.percentage() + "%) is below minimum threshold (" + minimumAttendancePercentage + "%)");
        }
    }

    @Override
    @Transactional
    public List<CertificateResponse> publishAllCertificates() {
        return certificateRepository.findAll().stream()
                .filter(cert -> cert.getStatus() == CertificateStatus.GENERATED)
                .map(this::publishSingleCertificate)
                .map(certificateMapper::toCertificateResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportCertificatesCsv() {
        List<Certificate> certificates = certificateRepository.findAll();
        List<User> users = userRepository.findAll();
        Map<String, String> userNames = new HashMap<>();
        for (User u : users) {
            if (u.getStudentId() != null) {
                userNames.put(u.getStudentId().toLowerCase(), u.getName() != null ? u.getName() : "Student");
            }
        }

        return csvExporter.exportCertificatesCsv(certificates, userNames);
    }

    // --- Private Story Helper Methods ---

    private Certificate buildCertificateEntity(String studentId, CertificateTemplateDto activeTemplate) {
        String certNumber = numberGenerator.generateUniqueCertificateNumber();
        String downloadUrl = "/api/v1/student/certificate";

        return Certificate.builder()
                .studentId(studentId)
                .templateId(activeTemplate != null ? activeTemplate.id() : null)
                .certificateNumber(certNumber)
                .certificateType(CertificateType.PARTICIPATION)
                .status(CertificateStatus.GENERATED)
                .fileUrl(downloadUrl)
                .generatedAt(LocalDateTime.now())
                .build();
    }

    private Certificate publishSingleCertificate(Certificate cert) {
        cert.setStatus(CertificateStatus.PUBLISHED);
        return certificateRepository.save(cert);
    }

    private void publishCertificateGeneratedEvent(Certificate cert, String studentName, String studentEmail) {
        try {
            CertificateGeneratedEvent event = new CertificateGeneratedEvent(
                    cert.getStudentId(),
                    studentEmail != null ? studentEmail : "",
                    studentName != null ? studentName : "",
                    cert.getFileUrl() != null ? cert.getFileUrl() : ""
            );
            notificationEventPublisher.publish(event);
        } catch (Exception e) {
            log.error("Failed to publish CertificateGeneratedEvent for student: {}", cert.getStudentId(), e);
        }
    }
}
