package com.cbp7.attendance.record.dto;

import jakarta.validation.constraints.NotBlank;

public record MarkAttendanceRequest(
        @NotBlank(message = "QR token is required")
        String qrToken
) {
}
