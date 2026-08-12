package com.cbp7.payment.entity;

public enum PaymentStatus {
    PENDING,
    INITIATED,
    PROCESSING,
    SUCCESS,
    FAILED,
    CANCELLED,
    UNDER_VERIFICATION,
    REFUNDED
}
