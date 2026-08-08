package com.cbp7.admin.student.dto;

import java.time.LocalDateTime;

public record AdminStudentListItemResponse(
        String id,
        String studentId,
        String name,
        String email,
        String phone,
        String course,
        String branch,
        String year,
        String registrationStatus,
        String paymentStatus,
        double attendancePercentage,
        int profileCompletion,
        LocalDateTime createdAt
) {}
