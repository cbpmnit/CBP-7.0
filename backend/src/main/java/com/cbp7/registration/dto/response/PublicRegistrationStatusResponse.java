package com.cbp7.registration.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record PublicRegistrationStatusResponse(
        UUID registrationId,
        String fullName,
        String studentId,
        String email,
        String mobileNumber,
        String programLevel,
        String department,
        Integer year,
        String studentType,
        String paymentStatus,
        String paymentTransactionId,
        BigDecimal amount,
        LocalDateTime createdAt
) {
    public PublicRegistrationStatusResponse(
            UUID registrationId,
            String fullName,
            String studentId,
            String email,
            String mobileNumber,
            String programLevel,
            String department,
            Integer year,
            String studentType,
            String paymentStatus,
            String paymentTransactionId,
            LocalDateTime createdAt
    ) {
        this(registrationId, fullName, studentId, email, mobileNumber, programLevel, department, year, studentType, paymentStatus, paymentTransactionId, new BigDecimal("100.00"), createdAt);
    }
}
