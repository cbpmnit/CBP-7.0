package com.cbp7.attendance.qr.event;

public record AttendanceQrGeneratedEvent(
        String studentId,
        String studentName,
        String studentEmail,
        String qrToken
) {
}
