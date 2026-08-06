package com.cbp7.certificate.service;

import com.cbp7.attendance.record.dto.StudentAttendanceSummaryResponse;
import com.cbp7.attendance.record.service.AttendanceQueryService;
import com.cbp7.auth.entity.User;
import com.cbp7.auth.repository.UserRepository;
import com.cbp7.cbp.entity.CbpRegistration;
import com.cbp7.cbp.repository.CbpRegistrationRepository;
import com.cbp7.certificate.dto.CertificateResponse;
import com.cbp7.certificate.entity.Certificate;
import com.cbp7.certificate.entity.CertificateStatus;
import com.cbp7.certificate.entity.CertificateType;
import com.cbp7.certificate.generator.PdfCertificateGenerator;
import com.cbp7.certificate.repository.CertificateRepository;
import com.cbp7.common.exception.DuplicateResourceException;
import com.cbp7.common.exception.ResourceNotFoundException;
import com.cbp7.notification.event.CertificateGeneratedEvent;
import com.cbp7.notification.event.NotificationEventPublisher;
import com.cbp7.payment.enums.PaymentStatus;
import com.cbp7.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class CertificateService {

    private final CertificateRepository certificateRepository;
    private final CbpRegistrationRepository cbpRegistrationRepository;
    private final PaymentRepository paymentRepository;
    private final AttendanceQueryService attendanceQueryService;
    private final UserRepository userRepository;
    private final PdfCertificateGenerator pdfCertificateGenerator;
    private final NotificationEventPublisher notificationEventPublisher;

    @Value("${certificate.minimum-attendance-percentage:75.0}")
    private double minimumAttendancePercentage;

    @Transactional
    public CertificateResponse generateCertificateForStudent(String studentId) {
        if (studentId == null || studentId.isBlank()) {
            throw new IllegalArgumentException("Student ID must not be empty");
        }

        if (certificateRepository.existsByStudentIdAndCertificateType(studentId, CertificateType.PARTICIPATION)) {
            Certificate existing = certificateRepository.findByStudentIdAndCertificateType(studentId, CertificateType.PARTICIPATION)
                    .orElseThrow();
            return CertificateResponse.fromEntity(existing);
        }

        verifyEligibility(studentId);

        User user = userRepository.findByStudentId(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found for student ID: " + studentId));

        String certNumber = generateUniqueCertificateNumber();
        byte[] pdfBytes = pdfCertificateGenerator.generateCertificatePdf(
                user.getName() != null ? user.getName() : studentId,
                studentId,
                certNumber,
                LocalDate.now()
        );

        String downloadUrl = "/api/v1/student/certificate";

        Certificate certificate = Certificate.builder()
                .studentId(studentId)
                .certificateNumber(certNumber)
                .certificateType(CertificateType.PARTICIPATION)
                .status(CertificateStatus.GENERATED)
                .fileUrl(downloadUrl)
                .generatedAt(LocalDateTime.now())
                .build();

        Certificate saved = certificateRepository.save(certificate);
        log.info("Successfully generated certificate {} for student {}", certNumber, studentId);

        publishCertificateGeneratedEvent(saved, user.getName(), user.getEmail());

        return CertificateResponse.fromEntity(saved);
    }

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

    @Transactional(readOnly = true)
    public CertificateResponse getStudentCertificate(String studentId) {
        if (studentId == null || studentId.isBlank()) {
            throw new IllegalArgumentException("Student ID must not be empty");
        }

        Certificate certificate = certificateRepository.findByStudentId(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Certificate not found for student: " + studentId));

        return CertificateResponse.fromEntity(certificate);
    }

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

    public void verifyEligibility(String studentId) {
        CbpRegistration registration = cbpRegistrationRepository.findByUserStudentIdIgnoreCase(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("CBP registration incomplete or not found for student: " + studentId));

        boolean paymentPaid = (registration.getRegistrationStatus() == com.cbp7.cbp.enums.RegistrationStatus.REGISTERED)
                || paymentRepository.existsByRegistrationIdAndPaymentStatus(registration.getId(), PaymentStatus.SUCCESS);

        if (!paymentPaid) {
            throw new IllegalStateException("Payment not completed for student: " + studentId);
        }

        StudentAttendanceSummaryResponse summary = attendanceQueryService.getStudentAttendanceSummary(studentId);
        if (summary.percentage() < minimumAttendancePercentage) {
            throw new IllegalStateException("Attendance percentage (" + summary.percentage() + "%) is below minimum threshold (" + minimumAttendancePercentage + "%)");
        }
    }

    private String generateUniqueCertificateNumber() {
        long count = certificateRepository.count() + 1;
        String number;
        do {
            number = "CBP-2026-" + String.format("%06d", count++);
        } while (certificateRepository.existsByCertificateNumber(number));
        return number;
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
