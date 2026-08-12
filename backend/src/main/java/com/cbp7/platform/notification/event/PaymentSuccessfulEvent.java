package com.cbp7.platform.notification.event;

public record PaymentSuccessfulEvent(
        String studentId,
        String studentEmail,
        String studentName,
        String paymentId,
        String amount
) {
}
