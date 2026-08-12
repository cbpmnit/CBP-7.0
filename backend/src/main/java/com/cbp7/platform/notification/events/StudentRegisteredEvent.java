package com.cbp7.platform.notification.events;

public record StudentRegisteredEvent(
        String studentId,
        String studentEmail,
        String studentName,
        String registrationId
) {
}
