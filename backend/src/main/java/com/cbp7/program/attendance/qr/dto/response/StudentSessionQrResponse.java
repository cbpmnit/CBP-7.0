package com.cbp7.program.attendance.qr.dto.response;

import java.util.UUID;

public record StudentSessionQrResponse(
        UUID sessionId,
        Integer dayNumber,
        String title,
        String sessionDate,
        String startTime,
        String endTime,
        String venue,
        String token,
        String qrImageBase64,
        String expiresAt,
        String qrCode,
        String generatedAt,
        Integer version
) {}
