package com.cbp7.admin.student.dto.response;

public record AdminDashboardStatsResponse(
        long totalStudents,
        long registered,
        long paymentCompleted,
        long paymentPending,
        long profileCompleted,
        double averageAttendance,
        long certificateEligible
) {}
