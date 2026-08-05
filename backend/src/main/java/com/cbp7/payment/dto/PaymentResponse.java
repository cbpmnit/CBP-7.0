package com.cbp7.payment.dto;

import com.cbp7.payment.enums.PaymentMode;
import com.cbp7.payment.enums.PaymentStatus;

import java.math.BigDecimal;
import java.util.UUID;

public record PaymentResponse(
        UUID paymentId,
        PaymentMode paymentMode,
        PaymentStatus paymentStatus,
        BigDecimal amount
) {}
