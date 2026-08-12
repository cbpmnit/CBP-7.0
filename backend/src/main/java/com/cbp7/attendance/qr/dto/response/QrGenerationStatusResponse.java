package com.cbp7.attendance.qr.dto.response;

public record QrGenerationStatusResponse(
        long totalStudents,
        long generatedQr,
        long pendingQr
) {}
