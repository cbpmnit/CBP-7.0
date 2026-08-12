package com.cbp7.program.attendance.qr.dto.response;

import java.util.UUID;

public record AttendanceQrResponse(
        UUID id,
        String token,
        String qrImage
) {}
