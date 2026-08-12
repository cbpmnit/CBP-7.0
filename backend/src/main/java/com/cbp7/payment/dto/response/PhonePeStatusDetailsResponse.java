package com.cbp7.payment.dto.response;

import com.cbp7.payment.entity.PaymentStatus;

import java.math.BigDecimal;
import java.util.UUID;

public record PhonePeStatusDetailsResponse(
        UUID paymentId,
        String transactionId,
        PaymentStatus paymentStatus,
        BigDecimal amount,
        String phonePeStatus
) {}
