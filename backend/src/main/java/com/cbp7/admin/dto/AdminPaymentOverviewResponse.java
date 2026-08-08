package com.cbp7.admin.dto;

import java.time.LocalDateTime;
import java.util.List;

public record AdminPaymentOverviewResponse(
        long totalRegistrations,
        long successfulPayments,
        long pendingPayments,
        long failedPayments,
        List<PaymentTransactionDto> transactions
) {
    public record PaymentTransactionDto(
            String studentName,
            String studentId,
            String registrationId,
            Double amount,
            String paymentStatus,
            String transactionId,
            LocalDateTime paymentTime
    ) {}
}
