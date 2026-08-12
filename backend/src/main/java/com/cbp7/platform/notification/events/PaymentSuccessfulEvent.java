package com.cbp7.platform.notification.events;

public record PaymentSuccessfulEvent(
        String studentId,
        String studentEmail,
        String studentName,
        String paymentId,
        String amount
) {
}
