package com.cbp7.platform.notification.event;

public record StudentRegisteredEvent(
        String studentId,
        String studentEmail,
        String studentName,
        String registrationId
) {
}
