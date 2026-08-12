package com.cbp7.platform.notification.events;

public record CertificateGeneratedEvent(
        String studentId,
        String studentEmail,
        String studentName,
        String certificateUrl
) {
}
