package com.cbp7.payment.dto;

public record PhonePeStatusResponse(
        String transactionId,
        String state,
        boolean success,
        String code,
        String message
) {}
