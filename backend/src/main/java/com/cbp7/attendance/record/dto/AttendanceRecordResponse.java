package com.cbp7.attendance.record.dto;

import com.cbp7.attendance.record.entity.AttendanceRecord;
import com.cbp7.attendance.record.entity.AttendanceStatus;

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
    public static AttendanceRecordResponse fromEntity(AttendanceRecord record) {
        if (record == null) return null;
        return new AttendanceRecordResponse(
                record.getId(),
                record.getSessionId(),
                record.getStudentId(),
                record.getMarkedBy(),
                record.getMarkedAt(),
                record.getStatus()
        );
    }

    public LocalDate attendanceDate() {
        return markedAt != null ? markedAt.toLocalDate() : LocalDate.now();
    }

    public LocalDateTime attendanceTime() {
        return markedAt;
    }
}
