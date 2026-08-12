package com.cbp7.payment.dto.response;

import com.cbp7.payment.entity.PaymentMode;
import com.cbp7.payment.entity.PaymentStatus;

import java.math.BigDecimal;
import java.util.UUID;

public record PaymentResponse(
        UUID paymentId,
        PaymentMode paymentMode,
        PaymentStatus paymentStatus,
        BigDecimal amount
) {}
