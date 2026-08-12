package com.cbp7.payment.dto.response;

public record PhonePeStatusResponse(
        String transactionId,
        String state,
        boolean success,
        String code,
        String message
) {}
