package com.cbp7.program.attendance.record.dto.response;

import java.time.LocalDateTime;

public record ScanAttendanceResponse(
        boolean success,
        String studentName,
        String studentId,
        String sessionTitle,
        LocalDateTime markedAt
) {}
