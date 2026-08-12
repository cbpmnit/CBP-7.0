package com.cbp7.attendance.qr.mapper;

import com.cbp7.attendance.qr.dto.response.SessionQrCodeResponse;
import com.cbp7.attendance.qr.entity.AttendanceQrCode;
import org.springframework.stereotype.Component;

@Component
public class AttendanceQrMapper {

    public SessionQrCodeResponse toSessionQrCodeResponse(AttendanceQrCode qrCode, String qrImageBase64) {
        if (qrCode == null) {
            return null;
        }
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
