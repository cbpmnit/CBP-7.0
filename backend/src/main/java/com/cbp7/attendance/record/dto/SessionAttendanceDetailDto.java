package com.cbp7.attendance.record.dto;

public record SessionAttendanceDetailDto(
        int dayNumber,
        String title,
        String status,
        String markedBy,
        String markedAt
) {}
