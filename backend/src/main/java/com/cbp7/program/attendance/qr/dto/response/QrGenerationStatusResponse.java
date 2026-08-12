package com.cbp7.program.attendance.qr.dto.response;

public record QrGenerationStatusResponse(
        long totalStudents,
        long generatedQr,
        long pendingQr
) {}
