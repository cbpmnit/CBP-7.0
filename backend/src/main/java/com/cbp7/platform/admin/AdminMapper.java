package com.cbp7.platform.admin;

import com.cbp7.platform.admin.dto.response.AdminDashboardSummaryResponse;
import com.cbp7.platform.admin.dto.response.AdminOperationsOverviewResponse;
import com.cbp7.platform.admin.dto.response.AdminPaymentOverviewResponse;
import com.cbp7.platform.admin.dto.response.AdminStudentDetailResponse;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

@Component
public class AdminMapper {

    public AdminDashboardSummaryResponse toDashboardSummaryResponse(
            long totalStudents,
            long registeredStudents,
            long paidStudents,
            long todayAttendance,
            long certificatesIssued
    ) {
        return new AdminDashboardSummaryResponse(
                totalStudents,
                registeredStudents,
                paidStudents,
                todayAttendance,
                certificatesIssued
        );
    }

    public AdminStudentDetailResponse toStudentDetailResponse(
            String studentId,
            String firstName,
            String lastName,
            String email,
            String branch,
            String course,
            boolean isPaid,
            double attendancePercentage,
            String registrationId
    ) {
        return new AdminStudentDetailResponse(
                studentId,
                firstName,
                lastName,
                email,
                branch,
                course,
                isPaid,
                attendancePercentage,
                registrationId
        );
    }

    public AdminPaymentOverviewResponse toPaymentOverviewResponse(
            long totalRegistrations,
            long successfulPayments,
            long pendingPayments,
            long failedPayments,
            List<AdminPaymentOverviewResponse.PaymentTransactionDto> transactions
    ) {
        return new AdminPaymentOverviewResponse(
                totalRegistrations,
                successfulPayments,
                pendingPayments,
                failedPayments,
                transactions
        );
    }

    public AdminOperationsOverviewResponse toOperationsOverviewResponse(
            boolean registrationOpen,
            boolean paymentGatewayActive,
            boolean sessionsConfigured,
            boolean attendanceSystemReady,
            boolean certificateTemplatePublished,
            boolean emailTemplatesReady,
            long registeredCount,
            long paidCount,
            long pendingPaymentCount,
            long failedPaymentCount,
            long sessionsConfiguredCount,
            long attendancePresentCount,
            long attendanceAbsentCount,
            double attendancePercentage,
            long certificatesEligibleCount,
            long certificatesGeneratedCount,
            long certificatesPublishedCount,
            UUID currentSessionId,
            String currentSessionTitle,
            Integer currentSessionDay,
            String currentSessionTime,
            String currentSessionStatus,
            String upcomingSessionTitle,
            Integer upcomingSessionDay,
            String upcomingSessionTime
    ) {
        return new AdminOperationsOverviewResponse(
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
}
