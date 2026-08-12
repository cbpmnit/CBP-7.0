package com.cbp7.program.attendance.record.event;

import com.cbp7.program.attendance.record.entity.AttendanceStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record AttendanceMarkedEvent(
        String studentId,
        String studentName,
        String studentEmail,
        String markedBy,
        LocalDate attendanceDate,
        LocalDateTime attendanceTime,
        AttendanceStatus status
) {
}
