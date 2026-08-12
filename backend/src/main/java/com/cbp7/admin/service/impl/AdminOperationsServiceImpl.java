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
        List<CbpRegistration> registrations = cbpRegistrationRepository.findAll();
        List<Payment> payments = paymentRepository.findAll();
        List<AttendanceSession> allSessions = sessionRepository.findAllByOrderByDayNumberAsc();

        long registeredCount = registrations.size();
        long paidCount = countPaymentsWithStatus(payments, PaymentStatus.SUCCESS);
        long pendingPaymentCount = countPaymentsWithStatus(payments, PaymentStatus.PENDING);
        long failedPaymentCount = countPaymentsWithStatus(payments, PaymentStatus.FAILED);
        long sessionsConfiguredCount = allSessions.size();

        AttendanceSession activeSession = findActiveSession();
        AttendanceSession targetSession = determineTargetSession(allSessions, activeSession);
        long totalRegisteredStudents = determineTotalStudentCount(registeredCount);

        AttendanceMetrics attendanceMetrics = calculateAttendanceMetrics(targetSession, totalRegisteredStudents);
        CertificateMetrics certificateMetrics = calculateCertificateMetrics(registrations, sessionsConfiguredCount);

        SessionDisplayDetails currentSession = buildCurrentSessionDetails(activeSession);
        SessionDisplayDetails upcomingSession = buildUpcomingSessionDetails(allSessions, activeSession);

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
                attendanceMetrics.presentCount(),
                attendanceMetrics.absentCount(),
                attendanceMetrics.attendancePercentage(),
                certificateMetrics.eligibleCount(),
                certificateMetrics.generatedCount(),
                certificateMetrics.publishedCount(),
                currentSession.sessionId(),
                currentSession.title(),
                currentSession.dayNumber(),
                currentSession.formattedTime(),
                currentSession.status(),
                upcomingSession.title(),
                upcomingSession.dayNumber(),
                upcomingSession.formattedTime()
        );
    }

    // --- Private Story Helper Methods ---

    private long countPaymentsWithStatus(List<Payment> payments, PaymentStatus status) {
        return payments.stream().filter(p -> p.getPaymentStatus() == status).count();
    }

    private AttendanceSession findActiveSession() {
        List<AttendanceSession> activeSessions = sessionRepository.findByStatus(SessionStatus.ACTIVE);
        return activeSessions.isEmpty() ? null : activeSessions.get(0);
    }

    private AttendanceSession determineTargetSession(List<AttendanceSession> allSessions, AttendanceSession activeSession) {
        if (activeSession != null) {
            return activeSession;
        }
        List<AttendanceSession> nonUpcoming = allSessions.stream()
                .filter(s -> s.getStatus() == SessionStatus.COMPLETED || s.getStatus() == SessionStatus.CLOSED)
                .toList();
        return nonUpcoming.isEmpty() ? null : nonUpcoming.get(nonUpcoming.size() - 1);
    }

    private long determineTotalStudentCount(long registeredCount) {
        long studentCount = userRepository.countByRole(Role.ROLE_STUDENT);
        return studentCount > 0 ? studentCount : Math.max(1, registeredCount);
    }

    private AttendanceMetrics calculateAttendanceMetrics(AttendanceSession targetSession, long totalStudents) {
        if (targetSession == null) {
            return new AttendanceMetrics(0, 0, 0.0);
        }
        long present = attendanceRecordRepository.countBySessionIdAndStatus(targetSession.getId(), AttendanceStatus.PRESENT);
        long absent = attendanceCalculator.calculateAbsentCount(totalStudents, present);
        double percentage = attendanceCalculator.calculatePercentage(present, totalStudents);
        return new AttendanceMetrics(present, absent, percentage);
    }

    private CertificateMetrics calculateCertificateMetrics(List<CbpRegistration> registrations, long totalSessions) {
        long eligible = totalSessions == 0 ? 0 : registrations.stream()
                .filter(reg -> isEligibleForCertificate(reg, totalSessions))
                .count();

        List<Certificate> certificates = certificateRepository.findAll();
        long generated = certificates.size();
        long published = certificates.stream().filter(c -> c.getStatus() == CertificateStatus.PUBLISHED).count();

        return new CertificateMetrics(eligible, generated, published);
    }

    private boolean isEligibleForCertificate(CbpRegistration reg, long totalSessions) {
        boolean isPaid = reg.getRegistrationStatus() == RegistrationStatus.REGISTERED
                || paymentRepository.existsByRegistrationIdAndPaymentStatus(reg.getId(), PaymentStatus.SUCCESS);
        if (!isPaid) {
            return false;
        }

        long attended = attendanceRecordRepository.countByStudentIdAndStatus(reg.getStudentId(), AttendanceStatus.PRESENT);
        double pct = ((double) attended / totalSessions) * 100.0;
        return pct >= 75.0;
    }

    private SessionDisplayDetails buildCurrentSessionDetails(AttendanceSession activeSession) {
        if (activeSession == null) {
            return new SessionDisplayDetails(null, "No Active Session", null, null, null);
        }
        return new SessionDisplayDetails(
                activeSession.getId(),
                activeSession.getTitle(),
                activeSession.getDayNumber(),
                formatSessionTime(activeSession.getStartTime(), activeSession.getEndTime()),
                activeSession.getStatus().name()
        );
    }

    private SessionDisplayDetails buildUpcomingSessionDetails(List<AttendanceSession> allSessions, AttendanceSession activeSession) {
        AttendanceSession upcoming = activeSession != null
                ? allSessions.stream().filter(s -> s.getDayNumber() > activeSession.getDayNumber() && s.getStatus() == SessionStatus.UPCOMING).findFirst().orElse(null)
                : allSessions.stream().filter(s -> s.getStatus() == SessionStatus.UPCOMING).findFirst().orElse(null);

        if (upcoming == null) {
            return new SessionDisplayDetails(null, "No Upcoming Session", null, null, null);
        }
        return new SessionDisplayDetails(
                upcoming.getId(),
                upcoming.getTitle(),
                upcoming.getDayNumber(),
                formatSessionTime(upcoming.getStartTime(), upcoming.getEndTime()),
                upcoming.getStatus().name()
        );
    }

    private String formatSessionTime(LocalTime start, LocalTime end) {
        if (start == null || end == null) return "Time not set";
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("hh:mm a");
        return start.format(formatter) + " - " + end.format(formatter);
    }

    private record AttendanceMetrics(long presentCount, long absentCount, double attendancePercentage) {}
    private record CertificateMetrics(long eligibleCount, long generatedCount, long publishedCount) {}
    private record SessionDisplayDetails(UUID sessionId, String title, Integer dayNumber, String formattedTime, String status) {}
}
