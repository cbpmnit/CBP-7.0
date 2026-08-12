package com.cbp7.program.attendance.record.dto.common;

import com.cbp7.program.attendance.record.entity.AttendanceStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record SessionAttendanceStatusDto(
        UUID sessionId,
        Integer dayNumber,
        String title,
        LocalDate sessionDate,
        AttendanceStatus status,
        LocalDateTime markedAt
) {}
