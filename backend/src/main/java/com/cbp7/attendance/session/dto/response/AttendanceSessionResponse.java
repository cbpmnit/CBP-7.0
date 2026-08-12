package com.cbp7.attendance.session.dto.response;

import com.cbp7.attendance.session.entity.AttendanceSession;
import com.cbp7.attendance.session.entity.SessionStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.UUID;

public record AttendanceSessionResponse(
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
    public static AttendanceSessionResponse fromEntity(AttendanceSession session, long attendanceCount) {
        if (session == null) return null;
        return new AttendanceSessionResponse(
                session.getId(),
                session.getDayNumber(),
                session.getTitle(),
                session.getDescription(),
                session.getSessionDate(),
                session.getStartTime(),
                session.getEndTime(),
                session.getVenue(),
                session.getStatus(),
                session.isVisibility(),
                session.getCreatedBy(),
                session.getCreatedAt(),
                attendanceCount
        );
    }
}
