package com.cbp7.notification.event;

public record StudentRegisteredEvent(
        String studentId,
        String studentEmail,
        String studentName,
        String registrationId
) {
}
