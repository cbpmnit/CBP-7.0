package com.cbp7.platform.admin.dto.response;

public record AdminStudentDetailResponse(
        String studentId,
        String firstName,
        String lastName,
        String email,
        String department,
        String programLevel,
        boolean paymentCompleted,
        double attendancePercentage,
        String registrationId
) {}
