package com.cbp7.platform.admin.service.impl;

import com.cbp7.platform.admin.dto.response.AdminDashboardSummaryResponse;
import com.cbp7.platform.admin.dto.response.AdminPaymentOverviewResponse;
import com.cbp7.platform.admin.dto.response.AdminStudentDetailResponse;
import com.cbp7.platform.admin.helper.AdminPaymentCsvExporter;
import com.cbp7.platform.admin.AdminMapper;
import com.cbp7.platform.admin.service.AdminDashboardService;
import com.cbp7.program.attendance.record.AttendanceCalculator;
import com.cbp7.program.attendance.record.entity.AttendanceStatus;
import com.cbp7.program.attendance.record.repository.AttendanceRecordRepository;
import com.cbp7.program.attendance.session.repository.AttendanceSessionRepository;
import com.cbp7.identity.auth.entity.Role;
import com.cbp7.identity.auth.entity.User;
import com.cbp7.identity.auth.repository.UserRepository;
import com.cbp7.program.registration.entity.CbpRegistration;
import com.cbp7.program.registration.entity.RegistrationStatus;
import com.cbp7.program.registration.repository.CbpRegistrationRepository;
import com.cbp7.program.certificate.repository.CertificateRepository;
import com.cbp7.payment.entity.Payment;
import com.cbp7.payment.entity.PaymentStatus;
import com.cbp7.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminDashboardServiceImpl implements AdminDashboardService {

    private final UserRepository userRepository;
    private final CbpRegistrationRepository cbpRegistrationRepository;
    private final PaymentRepository paymentRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final AttendanceSessionRepository attendanceSessionRepository;
    private final CertificateRepository certificateRepository;
    private final AdminMapper adminMapper;
    private final AdminPaymentCsvExporter paymentCsvExporter;
    private final AttendanceCalculator attendanceCalculator;

    @Override
    public AdminDashboardSummaryResponse getSummary() {
        List<User> studentUsers = fetchActiveStudentUsers();
        List<CbpRegistration> registrations = cbpRegistrationRepository.findAll();

        long totalStudents = Math.max(studentUsers.size(), registrations.size());
        long paidStudents = countPaidStudents(studentUsers, registrations);
        long todayAttendance = attendanceRecordRepository.count();
        long certificatesIssued = certificateRepository.count();

        return adminMapper.toDashboardSummaryResponse(
                totalStudents,
                totalStudents,
                paidStudents,
                todayAttendance,
                certificatesIssued
        );
    }

    @Override
    public List<AdminStudentDetailResponse> searchStudents(String search) {
        List<CbpRegistration> registrations = cbpRegistrationRepository.findAll();
        long totalSessions = attendanceSessionRepository.count();

        // Preload successful payments to avoid N+1 DB calls inside stream
        List<Payment> successfulPayments = paymentRepository.findByPaymentStatus(PaymentStatus.SUCCESS);
        Set<UUID> paidRegIds = successfulPayments.stream()
                .map(Payment::getRegistrationId)
                .filter(id -> id != null)
                .collect(Collectors.toSet());

        return registrations.stream()
                .filter(reg -> matchesSearchQuery(reg, search))
                .map(reg -> buildStudentDetail(reg, totalSessions, paidRegIds))
                .toList();
    }

    @Override
    public AdminPaymentOverviewResponse getPaymentOverview() {
        List<CbpRegistration> registrations = cbpRegistrationRepository.findAll();
        List<Payment> payments = paymentRepository.findAll();

        long totalRegistrations = registrations.size();
        long successfulPayments = countPaymentsWithStatus(payments, PaymentStatus.SUCCESS);
        long pendingPayments = countPaymentsWithStatus(payments, PaymentStatus.PENDING);
        long failedPayments = countPaymentsWithStatus(payments, PaymentStatus.FAILED);

        Map<UUID, CbpRegistration> registrationsById = registrations.stream()
                .collect(Collectors.toMap(CbpRegistration::getId, r -> r, (a, b) -> a));

        List<AdminPaymentOverviewResponse.PaymentTransactionDto> transactions = payments.stream()
                .map(payment -> buildPaymentTransactionDto(payment, registrationsById))
                .toList();

        return adminMapper.toPaymentOverviewResponse(
                totalRegistrations,
                successfulPayments,
                pendingPayments,
                failedPayments,
                transactions
        );
    }

    @Override
    public byte[] exportPaymentsCsv(String search, String paymentStatus) {
        AdminPaymentOverviewResponse overview = getPaymentOverview();
        return paymentCsvExporter.exportPaymentsCsv(overview.transactions(), search, paymentStatus);
    }

    // --- Private Story Helper Methods ---

    private List<User> fetchActiveStudentUsers() {
        return userRepository.findAll().stream()
                .filter(u -> u.hasRole(Role.ROLE_STUDENT) && !u.hasRole(Role.ROLE_ADMIN) && Boolean.TRUE.equals(u.getEnabled()))
                .toList();
    }

    private long countPaidStudents(List<User> studentUsers, List<CbpRegistration> registrations) {
        List<Payment> successfulPayments = paymentRepository.findByPaymentStatus(PaymentStatus.SUCCESS);
        Set<UUID> paidUserIds = successfulPayments.stream()
                .map(Payment::getUserId)
                .filter(id -> id != null)
                .collect(Collectors.toSet());

        Set<UUID> paidRegIds = successfulPayments.stream()
                .map(Payment::getRegistrationId)
                .filter(id -> id != null)
                .collect(Collectors.toSet());

        return studentUsers.stream()
                .filter(u -> isStudentPaymentCompleteFast(u, registrations, paidUserIds, paidRegIds))
                .count();
    }

    private boolean isStudentPaymentCompleteFast(User user, List<CbpRegistration> registrations, Set<UUID> paidUserIds, Set<UUID> paidRegIds) {
        if (paidUserIds.contains(user.getId())) {
            return true;
        }
        return registrations.stream().anyMatch(r ->
                isRegistrationLinkedToUser(r, user) && (r.getRegistrationStatus() == RegistrationStatus.REGISTERED || paidRegIds.contains(r.getId()))
        );
    }

    private boolean isRegistrationLinkedToUser(CbpRegistration reg, User user) {
        boolean matchById = reg.getUser() != null && user.getId().equals(reg.getUser().getId());
        boolean matchByStudentId = user.getStudentId() != null && user.getStudentId().equalsIgnoreCase(reg.getStudentId());
        return matchById || matchByStudentId;
    }

    private boolean matchesSearchQuery(CbpRegistration reg, String search) {
        if (search == null || search.trim().isEmpty()) {
            return true;
        }
        String query = search.trim().toLowerCase();
        String studentId = reg.getStudentId() != null ? reg.getStudentId().toLowerCase() : "";
        String name = ((reg.getFirstName() != null ? reg.getFirstName() : "") + " " +
                (reg.getLastName() != null ? reg.getLastName() : "")).toLowerCase();
        String email = reg.getEmail() != null ? reg.getEmail().toLowerCase() : "";

        return studentId.contains(query) || name.contains(query) || email.contains(query);
    }

    private AdminStudentDetailResponse buildStudentDetail(CbpRegistration reg, long totalSessions, Set<UUID> paidRegIds) {
        long attended = reg.getStudentId() != null
                ? attendanceRecordRepository.countByStudentIdAndStatus(reg.getStudentId(), AttendanceStatus.PRESENT)
                : 0;
        double attendancePercentage = attendanceCalculator.calculatePercentage(attended, totalSessions);
        boolean isPaid = reg.getRegistrationStatus() == RegistrationStatus.REGISTERED || paidRegIds.contains(reg.getId());

        return adminMapper.toStudentDetailResponse(
                reg.getStudentId(),
                reg.getFirstName(),
                reg.getLastName(),
                reg.getEmail(),
                reg.getBranch(),
                reg.getCourse(),
                isPaid,
                attendancePercentage,
                reg.getRegistrationId()
        );
    }

    private long countPaymentsWithStatus(List<Payment> payments, PaymentStatus status) {
        return payments.stream().filter(p -> p.getPaymentStatus() == status).count();
    }

    private AdminPaymentOverviewResponse.PaymentTransactionDto buildPaymentTransactionDto(
            Payment payment, Map<UUID, CbpRegistration> registrationsById
    ) {
        String regIdStr = payment.getRegistrationId() != null ? payment.getRegistrationId().toString() : "-";
        String studentId = "-";
        String studentName = "Student";

        CbpRegistration reg = payment.getRegistrationId() != null ? registrationsById.get(payment.getRegistrationId()) : null;
        if (reg != null) {
            studentId = reg.getStudentId() != null ? reg.getStudentId() : "-";
            studentName = (reg.getFirstName() != null ? reg.getFirstName() : "") + " " + (reg.getLastName() != null ? reg.getLastName() : "");
            regIdStr = reg.getRegistrationId() != null ? reg.getRegistrationId() : regIdStr;
        }

        Double amountVal = payment.getAmount() != null ? payment.getAmount().doubleValue() : 0.0;
        String txnId = payment.getTransactionId() != null ? payment.getTransactionId() : "-";

        return new AdminPaymentOverviewResponse.PaymentTransactionDto(
                studentName.trim(),
                studentId,
                regIdStr,
                amountVal,
                payment.getPaymentStatus().name(),
                txnId,
                payment.getCreatedAt()
        );
    }
}
