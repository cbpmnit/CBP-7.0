package com.cbp7.attendance.qr.dto;

import java.util.UUID;

public record AttendanceQrResponse(
        UUID id,
        String token,
        String qrImage
) {
}
