package com.cbp7.attendance.record.dto;

import java.time.LocalDateTime;

public record ScanAttendanceResponse(
        boolean success,
        String studentName,
        String studentId,
        String sessionTitle,
        LocalDateTime markedAt
) {}
