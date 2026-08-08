package com.cbp7.attendance.qr.dto;

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
        String expiresAt
) {}
