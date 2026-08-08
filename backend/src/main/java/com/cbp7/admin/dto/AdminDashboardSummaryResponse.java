package com.cbp7.admin.dto;

public record AdminDashboardSummaryResponse(
        long totalStudents,
        long registeredStudents,
        long paidStudents,
        long todayAttendance,
        long certificatesIssued
) {}
