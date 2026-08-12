package com.cbp7.attendance.record.dto.request;

import java.util.UUID;

public record MarkAttendanceRequest(
        String qrToken,
        UUID sessionId,
        String studentId
) {}
