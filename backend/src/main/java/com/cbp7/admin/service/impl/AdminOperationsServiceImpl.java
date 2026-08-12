package com.cbp7.admin.service.impl;

import com.cbp7.admin.dto.response.AdminOperationsOverviewResponse;
import com.cbp7.admin.helper.AdminOperationsReadinessEvaluator;
import com.cbp7.admin.mapper.AdminMapper;
import com.cbp7.admin.service.AdminOperationsService;
import com.cbp7.attendance.record.calculator.AttendanceCalculator;
import com.cbp7.attendance.record.entity.AttendanceStatus;
import com.cbp7.attendance.record.repository.AttendanceRecordRepository;
import com.cbp7.attendance.session.entity.AttendanceSession;
import com.cbp7.attendance.session.entity.SessionStatus;
import com.cbp7.attendance.session.repository.AttendanceSessionRepository;
import com.cbp7.auth.entity.Role;
import com.cbp7.auth.repository.UserRepository;
import com.cbp7.cbp.entity.CbpRegistration;
import com.cbp7.cbp.enums.RegistrationStatus;
import com.cbp7.cbp.repository.CbpRegistrationRepository;
import com.cbp7.certificate.entity.Certificate;
import com.cbp7.certificate.entity.CertificateStatus;
import com.cbp7.certificate.repository.CertificateRepository;
import com.cbp7.payment.entity.Payment;
import com.cbp7.payment.enums.PaymentStatus;
import com.cbp7.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminOperationsServiceImpl implements AdminOperationsService {

    private final UserRepository userRepository;
    private final CbpRegistrationRepository cbpRegistrationRepository;
    private final PaymentRepository paymentRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final AttendanceSessionRepository sessionRepository;
    private final CertificateRepository certificateRepository;
    private final AdminMapper adminMapper;
    private final AdminOperationsReadinessEvaluator readinessEvaluator;
    private final AttendanceCalculator attendanceCalculator;

    @Override
    public AdminOperationsOverviewResponse getOverview() {
        // 1. Core Counts
        List<CbpRegistration> registrations = cbpRegistrationRepository.findAll();
        long registeredCount = registrations.size();

        List<Payment> payments = paymentRepository.findAll();
        long paidCount = payments.stream().filter(p -> p.getPaymentStatus() == PaymentStatus.SUCCESS).count();
        long pendingPaymentCount = payments.stream().filter(p -> p.getPaymentStatus() == PaymentStatus.PENDING).count();
        long failedPaymentCount = payments.stream().filter(p -> p.getPaymentStatus() == PaymentStatus.FAILED).count();

        List<AttendanceSession> allSessions = sessionRepository.findAllByOrderByDayNumberAsc();
        long sessionsConfiguredCount = allSessions.size();

        // 2. Active / Today's Attendance
        long totalRegisteredStudents = userRepository.countByRole(Role.ROLE_STUDENT);
        if (totalRegisteredStudents == 0) {
            totalRegisteredStudents = Math.max(1, registeredCount);
        }

        List<AttendanceSession> activeSessions = sessionRepository.findByStatus(SessionStatus.ACTIVE);
        AttendanceSession activeSession = activeSessions.isEmpty() ? null : activeSessions.get(0);
        AttendanceSession targetSession = activeSession;

        if (targetSession == null) {
            List<AttendanceSession> nonUpcoming = allSessions.stream()
                    .filter(s -> s.getStatus() == SessionStatus.COMPLETED || s.getStatus() == SessionStatus.CLOSED)
                    .toList();
            if (!nonUpcoming.isEmpty()) {
                targetSession = nonUpcoming.get(nonUpcoming.size() - 1);
            }
        }

        long attendancePresentCount = 0;
        long attendanceAbsentCount = 0;
        double attendancePercentage = 0.0;

        if (targetSession != null) {
            attendancePresentCount = attendanceRecordRepository.countBySessionIdAndStatus(targetSession.getId(), AttendanceStatus.PRESENT);
            attendanceAbsentCount = attendanceCalculator.calculateAbsentCount(totalRegisteredStudents, attendancePresentCount);
            attendancePercentage = attendanceCalculator.calculatePercentage(attendancePresentCount, totalRegisteredStudents);
        }

        // 3. Certificates stats
        long totalSessions = sessionsConfiguredCount;
        long certificatesEligibleCount = registrations.stream()
                .filter(reg -> {
                    boolean paid = (reg.getRegistrationStatus() == RegistrationStatus.REGISTERED)
                            || paymentRepository.existsByRegistrationIdAndPaymentStatus(reg.getId(), PaymentStatus.SUCCESS);
                    if (!paid) return false;

                    if (totalSessions == 0) return false;

                    long attended = attendanceRecordRepository.countByStudentIdAndStatus(
                            reg.getStudentId(), AttendanceStatus.PRESENT
                    );
                    double pct = ((double) attended / totalSessions) * 100.0;
                    return pct >= 75.0;
                })
                .count();

        List<Certificate> certificates = certificateRepository.findAll();
        long certificatesGeneratedCount = certificates.size();
        long certificatesPublishedCount = certificates.stream()
                .filter(c -> c.getStatus() == CertificateStatus.PUBLISHED)
                .count();

        // 4. Current Session Details
        UUID currentSessionId = activeSession != null ? activeSession.getId() : null;
        String currentSessionTitle = activeSession != null ? activeSession.getTitle() : "No Active Session";
        Integer currentSessionDay = activeSession != null ? activeSession.getDayNumber() : null;
        String currentSessionTime = activeSession != null ? formatSessionTime(activeSession.getStartTime(), activeSession.getEndTime()) : null;
        String currentSessionStatus = activeSession != null ? activeSession.getStatus().name() : null;

        // 5. Upcoming Session Details
        AttendanceSession upcomingSession = null;
        if (activeSession != null) {
            upcomingSession = allSessions.stream()
                    .filter(s -> s.getDayNumber() > activeSession.getDayNumber() && s.getStatus() == SessionStatus.UPCOMING)
                    .findFirst().orElse(null);
        } else {
            upcomingSession = allSessions.stream()
                    .filter(s -> s.getStatus() == SessionStatus.UPCOMING)
                    .findFirst().orElse(null);
        }

        String upcomingSessionTitle = upcomingSession != null ? upcomingSession.getTitle() : "No Upcoming Session";
        Integer upcomingSessionDay = upcomingSession != null ? upcomingSession.getDayNumber() : null;
        String upcomingSessionTime = upcomingSession != null ? formatSessionTime(upcomingSession.getStartTime(), upcomingSession.getEndTime()) : null;

        // 6. Readiness Checks
        boolean registrationOpen = readinessEvaluator.isRegistrationOpen(registeredCount);
        boolean paymentGatewayActive = readinessEvaluator.isPaymentGatewayActive(paidCount, pendingPaymentCount);
        boolean sessionsConfigured = readinessEvaluator.isSessionsConfigured(sessionsConfiguredCount);
        boolean attendanceSystemReady = readinessEvaluator.isAttendanceSystemReady(sessionsConfiguredCount);
        boolean certificateTemplatePublished = readinessEvaluator.isCertificateTemplatePublished();
        boolean emailTemplatesReady = readinessEvaluator.isEmailTemplatesReady();

        return adminMapper.toOperationsOverviewResponse(
                registrationOpen,
                paymentGatewayActive,
                sessionsConfigured,
                attendanceSystemReady,
                certificateTemplatePublished,
                emailTemplatesReady,
                registeredCount,
                paidCount,
                pendingPaymentCount,
                failedPaymentCount,
                sessionsConfiguredCount,
                attendancePresentCount,
                attendanceAbsentCount,
                attendancePercentage,
                certificatesEligibleCount,
                certificatesGeneratedCount,
                certificatesPublishedCount,
                currentSessionId,
                currentSessionTitle,
                currentSessionDay,
                currentSessionTime,
                currentSessionStatus,
                upcomingSessionTitle,
                upcomingSessionDay,
                upcomingSessionTime
        );
    }

    private String formatSessionTime(LocalTime start, LocalTime end) {
        if (start == null || end == null) return "Time not set";
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("hh:mm a");
        return start.format(formatter) + " - " + end.format(formatter);
    }
}
