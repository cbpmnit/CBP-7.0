package com.cbp7.program.attendance.qr.event;

public record AttendanceQrGeneratedEvent(
        String studentId,
        String studentName,
        String studentEmail,
        String qrToken
) {
}
