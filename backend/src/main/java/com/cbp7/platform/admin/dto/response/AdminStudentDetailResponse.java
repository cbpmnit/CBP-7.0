package com.cbp7.platform.admin.dto.response;

public record AdminStudentDetailResponse(
        String studentId,
        String firstName,
        String lastName,
        String email,
        String branch,
        String course,
        boolean paymentCompleted,
        double attendancePercentage,
        String registrationId
) {}
