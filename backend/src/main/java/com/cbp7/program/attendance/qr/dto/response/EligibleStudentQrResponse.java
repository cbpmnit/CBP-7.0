package com.cbp7.program.attendance.qr.dto.response;

public record EligibleStudentQrResponse(
        String studentId,
        String name,
        String email,
        String registrationStatus,
        String paymentStatus,
        String qrStatus,
        String attendanceStatus
) {
}
