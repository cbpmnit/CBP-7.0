package com.cbp7.registration.dto.response;

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
        LocalDateTime createdAt
) {}
