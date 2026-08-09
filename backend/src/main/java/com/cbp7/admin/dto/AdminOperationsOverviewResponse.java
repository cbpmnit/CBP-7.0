package com.cbp7.admin.dto;

import java.util.UUID;

public record AdminOperationsOverviewResponse(
        // Readiness checks
        boolean registrationOpen,
        boolean paymentGatewayActive,
        boolean sessionsConfigured,
        boolean attendanceSystemReady,
        boolean certificateTemplatePublished,
        boolean emailTemplatesReady,

        // Core Counts
        long registeredCount,
        long paidCount,
        long pendingPaymentCount,
        long failedPaymentCount,
        long sessionsConfiguredCount,
        
        // Active Attendance
        long attendancePresentCount,
        long attendanceAbsentCount,
        double attendancePercentage,

        // Certificate stats
        long certificatesEligibleCount,
        long certificatesGeneratedCount,
        long certificatesPublishedCount,

        // Current Session Details
        UUID currentSessionId,
        String currentSessionTitle,
        Integer currentSessionDay,
        String currentSessionTime,
        String currentSessionStatus,

        // Upcoming Session Details
        String upcomingSessionTitle,
        Integer upcomingSessionDay,
        String upcomingSessionTime
) {}
