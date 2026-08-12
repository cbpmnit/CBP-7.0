package com.cbp7.program.attendance.record.dto.request;

import jakarta.validation.constraints.NotBlank;

public record ScanSessionQrRequest(
        @NotBlank(message = "Session QR Token is required")
        String qrToken,

        @NotBlank(message = "Student ID is required")
        String studentId
) {}
