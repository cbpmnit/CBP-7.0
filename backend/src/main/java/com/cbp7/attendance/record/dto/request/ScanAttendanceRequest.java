package com.cbp7.attendance.record.dto.request;

import jakarta.validation.constraints.NotBlank;

public record ScanAttendanceRequest(
        @NotBlank(message = "QR token is required")
        String qrToken
) {}
