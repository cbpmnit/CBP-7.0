package com.cbp7.payment.dto;

import com.cbp7.payment.enums.PaymentStatus;

import java.util.UUID;

public record PhonePePaymentResponse(
        UUID paymentId,
        String transactionId,
        String redirectUrl,
        PaymentStatus paymentStatus
) {}
