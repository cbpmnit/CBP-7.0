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
) {
    public static SessionUpdateResponse fromResponse(
            String message,
            boolean qrValidityUpdated,
            AttendanceSessionResponse response
    ) {
        return new SessionUpdateResponse(
                message,
                qrValidityUpdated,
                response.id(),
                response.dayNumber(),
                response.title(),
                response.description(),
                response.sessionDate(),
                response.startTime(),
                response.endTime(),
                response.venue(),
                response.status(),
                response.visibility(),
                response.createdBy(),
                response.createdAt(),
                response.attendanceCount()
        );
    }
}
