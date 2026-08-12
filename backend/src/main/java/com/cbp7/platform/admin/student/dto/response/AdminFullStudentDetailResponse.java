package com.cbp7.platform.admin.student.dto.response;

import java.time.LocalDateTime;

public record AdminFullStudentDetailResponse(
        StudentBasicDto student,
        ProfileDetailDto profile,
        RegistrationDetailDto registration,
        PaymentDetailDto payment,
        AttendanceDetailDto attendance,
        CertificateDetailDto certificate
) {
    public record StudentBasicDto(
            String id,
            String studentId,
            String name,
            String email,
            String phone
    ) {}

    public record ProfileDetailDto(
            String firstName,
            String lastName,
            String gender,
            String dob,
            String institute,
            String course,
            String branch,
            String year,
            String section,
            Boolean hosteller,
            String roomNumber,
            String city,
            String state
    ) {}

    public record RegistrationDetailDto(
            String registrationId,
            String status,
            LocalDateTime registeredAt
    ) {}

    public record PaymentDetailDto(
            String status,
            Double amount,
            String transactionId,
            LocalDateTime paidAt
    ) {}

    public record AttendanceDetailDto(
            long totalSessions,
            long attendedSessions,
            double percentage
    ) {}

    public record CertificateDetailDto(
            String status,
            String certificateNumber,
            LocalDateTime issuedAt
    ) {}
}
