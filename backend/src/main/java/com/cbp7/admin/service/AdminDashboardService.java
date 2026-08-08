package com.cbp7.admin.service;

import com.cbp7.admin.dto.AdminDashboardSummaryResponse;
import com.cbp7.admin.dto.AdminPaymentOverviewResponse;
import com.cbp7.admin.dto.AdminStudentDetailResponse;
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

    private final CbpRegistrationRepository cbpRegistrationRepository;
    private final PaymentRepository paymentRepository;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final AttendanceSessionRepository attendanceSessionRepository;
    private final CertificateRepository certificateRepository;

    public AdminDashboardSummaryResponse getSummary() {
        List<CbpRegistration> registrations = cbpRegistrationRepository.findAll();
        long totalStudents = registrations.size();
        long registeredStudents = totalStudents;

        long paidStudents = registrations.stream()
                .filter(r -> r.getRegistrationStatus() == RegistrationStatus.REGISTERED
                        || paymentRepository.existsByRegistrationIdAndPaymentStatus(r.getId(), PaymentStatus.SUCCESS))
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
}
