package com.cbp7.attendance.session.dto;

import com.cbp7.attendance.session.entity.SessionStatus;
import java.time.LocalDate;
import java.time.LocalTime;

public record UpdateAttendanceSessionRequest(
        Integer dayNumber,
        String title,
        String description,
        LocalDate sessionDate,
        LocalTime startTime,
        LocalTime endTime,
        String venue,
        SessionStatus status,
        Boolean visibility
) {}
