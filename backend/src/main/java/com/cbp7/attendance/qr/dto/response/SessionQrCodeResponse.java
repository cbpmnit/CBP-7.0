package com.cbp7.attendance.qr.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

public record SessionQrCodeResponse(
        UUID id,
        UUID sessionId,
        String token,
        String qrImageBase64,
        LocalDateTime generatedAt,
        LocalDateTime expiresAt,
        boolean active
) {}
