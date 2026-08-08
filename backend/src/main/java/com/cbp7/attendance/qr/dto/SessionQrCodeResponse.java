package com.cbp7.attendance.qr.dto;

import com.cbp7.attendance.qr.entity.AttendanceQrCode;

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
) {
    public static SessionQrCodeResponse fromEntity(AttendanceQrCode qrCode, String qrImageBase64) {
        if (qrCode == null) return null;
        return new SessionQrCodeResponse(
                qrCode.getId(),
                qrCode.getSessionId(),
                qrCode.getToken(),
                qrImageBase64,
                qrCode.getGeneratedAt(),
                qrCode.getExpiresAt(),
                qrCode.isActive()
        );
    }
}
