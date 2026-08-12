package com.cbp7.program.attendance.session;

import com.cbp7.program.attendance.session.dto.response.AttendanceSessionResponse;
import com.cbp7.program.attendance.session.dto.response.SessionUpdateResponse;
import com.cbp7.program.attendance.session.entity.AttendanceSession;
import org.springframework.stereotype.Component;

@Component
public class AttendanceSessionMapper {

    public AttendanceSessionResponse toResponse(AttendanceSession session, long attendanceCount) {
        if (session == null) {
            return null;
        }
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

    public SessionUpdateResponse toUpdateResponse(
            String message,
            boolean qrValidityUpdated,
            AttendanceSessionResponse response
    ) {
        if (response == null) {
            return null;
        }
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
