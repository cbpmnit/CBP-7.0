package com.cbp7.admin.service;

import com.cbp7.admin.dto.AdminDashboardSummaryResponse;
import com.cbp7.admin.dto.AdminPaymentOverviewResponse;
import com.cbp7.admin.dto.AdminStudentDetailResponse;
import com.cbp7.auth.entity.Role;
import com.cbp7.auth.entity.User;
import com.cbp7.auth.repository.UserRepository;
import com.cbp7.cbp.entity.CbpRegistration;
import com.cbp7.cbp.enums.RegistrationStatus;
import com.cbp7.cbp.repository.CbpRegistrationRepository;
import com.cbp7.certificate.repository.CertificateRepository;
import com.cbp7.attendance.record.entity.AttendanceStatus;
import com.cbp7.attendance.record.repository.AttendanceRecordRepository;
import com.cbp7.attendance.session.repository.AttendanceSessionRepository;
import com.cbp7.payment.entity.Payment;
import com.cbp7.payment.enums.PaymentStatus;
import com.cbp7.payment.repository.PaymentRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminDashboardService {

    private final UserRepository userRepository;
    private final CbpRegistrationRepository cbpRegistrationRepository;
    private final PaymentRepository paymentRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final AttendanceSessionRepository attendanceSessionRepository;
    private final CertificateRepository certificateRepository;

    public AdminDashboardSummaryResponse getSummary() {
        List<User> studentUsers = userRepository.findAll().stream()
                .filter(u -> u.hasRole(Role.ROLE_STUDENT) && !u.hasRole(Role.ROLE_ADMIN) && Boolean.TRUE.equals(u.getEnabled()))
                .toList();

        List<CbpRegistration> registrations = cbpRegistrationRepository.findAll();
        long totalStudents = Math.max(studentUsers.size(), registrations.size());
        long registeredStudents = totalStudents;

        long paidStudents = studentUsers.stream()
                .filter(u -> {
                    boolean byReg = registrations.stream().anyMatch(r ->
                            (r.getUser() != null && u.getId().equals(r.getUser().getId()) || (u.getStudentId() != null && u.getStudentId().equalsIgnoreCase(r.getStudentId())))
                                    && (r.getRegistrationStatus() == RegistrationStatus.REGISTERED || paymentRepository.existsByRegistrationIdAndPaymentStatus(r.getId(), PaymentStatus.SUCCESS)));
                    return byReg || paymentRepository.existsByUserIdAndPaymentStatus(u.getId(), PaymentStatus.SUCCESS);
                })
                .count();

        long todayAttendance = attendanceRecordRepository.count();
        long certificatesIssued = certificateRepository.count();

        return new AdminDashboardSummaryResponse(
                totalStudents,
                registeredStudents,
                paidStudents,
                todayAttendance,
                certificatesIssued
        );
    }

    public List<AdminStudentDetailResponse> searchStudents(String search) {
        List<CbpRegistration> registrations = cbpRegistrationRepository.findAll();
        long totalSessions = attendanceSessionRepository.count();

        return registrations.stream()
                .filter(r -> {
                    if (search == null || search.trim().isEmpty()) return true;
                    String query = search.trim().toLowerCase();
                    String studentId = r.getStudentId() != null ? r.getStudentId().toLowerCase() : "";
                    String name = (r.getFirstName() + " " + r.getLastName()).toLowerCase();
                    String email = r.getEmail() != null ? r.getEmail().toLowerCase() : "";
                    return studentId.contains(query) || name.contains(query) || email.contains(query);
                })
                .map(r -> {
                    long attended = attendanceRecordRepository.countByStudentIdAndStatus(
                            r.getStudentId(), AttendanceStatus.PRESENT
                    );
                    double pct = totalSessions > 0 ? ((double) attended / totalSessions) * 100.0 : 0.0;
                    boolean isPaid = r.getRegistrationStatus() == RegistrationStatus.REGISTERED
                            || paymentRepository.existsByRegistrationIdAndPaymentStatus(r.getId(), PaymentStatus.SUCCESS);

                    return new AdminStudentDetailResponse(
                            r.getStudentId(),
                            r.getFirstName(),
                            r.getLastName(),
                            r.getEmail(),
                            r.getBranch(),
                            r.getCourse(),
                            isPaid,
                            pct,
                            r.getRegistrationId()
                    );
                })
                .toList();
    }

    public AdminPaymentOverviewResponse getPaymentOverview() {
        List<CbpRegistration> registrations = cbpRegistrationRepository.findAll();
        List<Payment> payments = paymentRepository.findAll();

        long totalRegistrations = registrations.size();
        long successfulPayments = payments.stream().filter(p -> p.getPaymentStatus() == PaymentStatus.SUCCESS).count();
        long pendingPayments = payments.stream().filter(p -> p.getPaymentStatus() == PaymentStatus.PENDING).count();
        long failedPayments = payments.stream().filter(p -> p.getPaymentStatus() == PaymentStatus.FAILED).count();

        List<AdminPaymentOverviewResponse.PaymentTransactionDto> transactions = payments.stream()
                .map(p -> {
                    String regIdStr = p.getRegistrationId() != null ? p.getRegistrationId().toString() : "-";
                    String studentId = "-";
                    String studentName = "Student";

                    var regOpt = cbpRegistrationRepository.findById(p.getRegistrationId());
                    if (regOpt.isPresent()) {
                        CbpRegistration reg = regOpt.get();
                        studentId = reg.getStudentId();
                        studentName = reg.getFirstName() + " " + reg.getLastName();
                        regIdStr = reg.getRegistrationId();
                    }

                    Double amountVal = p.getAmount() != null ? p.getAmount().doubleValue() : 0.0;

                    return new AdminPaymentOverviewResponse.PaymentTransactionDto(
                            studentName,
                            studentId,
                            regIdStr,
                            amountVal,
                            p.getPaymentStatus().name(),
                            p.getTransactionId() != null ? p.getTransactionId() : "-",
                            p.getCreatedAt()
                    );
                })
                .toList();

        return new AdminPaymentOverviewResponse(
                totalRegistrations,
                successfulPayments,
                pendingPayments,
                failedPayments,
                transactions
        );
    }

    public byte[] exportPaymentsCsv(String search, String paymentStatus) {
        AdminPaymentOverviewResponse overview = getPaymentOverview();
        List<AdminPaymentOverviewResponse.PaymentTransactionDto> list = overview.transactions();

        String q = search != null ? search.trim().toLowerCase() : "";
        String statusFilter = paymentStatus != null && !paymentStatus.isBlank() && !"ALL".equalsIgnoreCase(paymentStatus)
                ? paymentStatus.trim().toUpperCase() : null;

        List<String> headers = List.of(
                "Student ID", "Student Name", "Amount (INR)", "Transaction ID",
                "Registration Ref", "Payment Status", "Payment Date"
        );

        List<List<String>> rows = new java.util.ArrayList<>();
        for (AdminPaymentOverviewResponse.PaymentTransactionDto tx : list) {
            if (!q.isEmpty()) {
                boolean match = (tx.studentName() != null && tx.studentName().toLowerCase().contains(q))
                        || (tx.studentId() != null && tx.studentId().toLowerCase().contains(q))
                        || (tx.transactionId() != null && tx.transactionId().toLowerCase().contains(q))
                        || (tx.registrationId() != null && tx.registrationId().toLowerCase().contains(q));
                if (!match) continue;
            }

            if (statusFilter != null && !statusFilter.equalsIgnoreCase(tx.paymentStatus())) {
                continue;
            }

            rows.add(List.of(
                    tx.studentId() != null ? tx.studentId() : "",
                    tx.studentName() != null ? tx.studentName() : "",
                    String.format("%.2f", tx.amount()),
                    tx.transactionId() != null ? tx.transactionId() : "",
                    tx.registrationId() != null ? tx.registrationId() : "",
                    tx.paymentStatus() != null ? tx.paymentStatus() : "",
                    tx.paymentTime() != null ? tx.paymentTime().toString() : ""
            ));
        }

        return com.cbp7.common.util.CsvExportUtil.generateCsv(headers, rows);
    }
}
