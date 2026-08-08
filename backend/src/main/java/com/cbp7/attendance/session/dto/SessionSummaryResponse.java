package com.cbp7.attendance.session.dto;

import java.time.LocalDate;
import java.util.UUID;

public record SessionSummaryResponse(
        UUID sessionId,
        Integer dayNumber,
        String sessionTitle,
        LocalDate sessionDate,
        long totalRegisteredStudents,
        long presentCount,
        long absentCount,
        double attendancePercentage
) {}
