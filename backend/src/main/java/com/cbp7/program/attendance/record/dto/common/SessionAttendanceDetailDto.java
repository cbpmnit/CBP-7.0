package com.cbp7.program.attendance.record.dto.common;

public record SessionAttendanceDetailDto(
        int dayNumber,
        String title,
        String status,
        String markedBy,
        String markedAt
) {}
