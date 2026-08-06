package com.cbp7.payment.dto;

import com.cbp7.payment.enums.PaymentStatus;
import java.math.BigDecimal;

public record PaymentStatusResponse(
        String transactionId,
        PaymentStatus paymentStatus,
        BigDecimal amount
) {}
