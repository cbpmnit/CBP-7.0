package com.cbp7.attendance.record.dto;

import com.cbp7.attendance.record.entity.AttendanceRecord;
import com.cbp7.attendance.record.entity.AttendanceStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

public record AttendanceRecordResponse(
        UUID id,
        String studentId,
        UUID qrCodeId,
        String markedBy,
        LocalDate attendanceDate,
        LocalDateTime attendanceTime,
        AttendanceStatus status
) {
    public static AttendanceRecordResponse fromEntity(AttendanceRecord record) {
        return new AttendanceRecordResponse(
                record.getId(),
                record.getStudentId(),
                record.getQrCodeId(),
                record.getMarkedBy(),
                record.getAttendanceDate(),
                record.getAttendanceTime(),
                record.getStatus()
        );
    }
}
