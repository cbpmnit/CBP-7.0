package com.cbp7.program.attendance.record.dto.response;

import com.cbp7.program.attendance.record.entity.AttendanceStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record AttendanceRecordResponse(
        UUID id,
        UUID sessionId,
        String studentId,
        String markedBy,
        LocalDateTime markedAt,
        AttendanceStatus status
) {
    public LocalDate attendanceDate() {
        return markedAt != null ? markedAt.toLocalDate() : LocalDate.now();
    }

    public LocalDateTime attendanceTime() {
        return markedAt;
    }
}
