package com.cbp7.attendance.session.dto.response;

import com.cbp7.attendance.session.entity.SessionStatus;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

public record SessionUpdateResponse(
        String message,
        boolean qrValidityUpdated,
        UUID id,
        Integer dayNumber,
        String title,
        String description,
        LocalDate sessionDate,
        LocalTime startTime,
        LocalTime endTime,
        String venue,
        SessionStatus status,
        boolean visibility,
        String createdBy,
        LocalDateTime createdAt,
        long attendanceCount
) {}
