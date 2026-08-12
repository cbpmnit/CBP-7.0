package com.cbp7.platform.admin.dto.response;

public record AdminDashboardSummaryResponse(
        long totalStudents,
        long registeredStudents,
        long paidStudents,
        long todayAttendance,
        long certificatesIssued
) {}
