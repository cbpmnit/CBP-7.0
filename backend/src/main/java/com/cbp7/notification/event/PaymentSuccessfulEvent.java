package com.cbp7.notification.event;

public record PaymentSuccessfulEvent(
        String studentId,
        String studentEmail,
        String studentName,
        String paymentId,
        String amount
) {
}
