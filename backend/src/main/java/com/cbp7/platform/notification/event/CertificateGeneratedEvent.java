package com.cbp7.platform.notification.event;

public record CertificateGeneratedEvent(
        String studentId,
        String studentEmail,
        String studentName,
        String certificateUrl
) {
}
