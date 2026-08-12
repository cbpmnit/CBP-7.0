package com.cbp7.payment.dto.response;

import com.cbp7.payment.enums.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record PaymentStatusResponse(
        String transactionId,
        PaymentStatus paymentStatus,
        BigDecimal amount,
        LocalDateTime updatedAt,
        UUID registrationId,
        LocalDateTime createdAt
) {}
