package com.cbp7.payment.dto.response;

import com.cbp7.payment.entity.PaymentStatus;

import java.util.UUID;

public record PhonePePaymentResponse(
        UUID paymentId,
        String transactionId,
        String redirectUrl,
        PaymentStatus paymentStatus
) {}
