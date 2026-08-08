package com.cbp7.attendance.qr.dto;

public record QrGenerationStatusResponse(
        long totalStudents,
        long generatedQr,
        long pendingQr
) {}
