package com.cbp7.program.attendance.record.dto.common;

import com.cbp7.program.attendance.record.entity.AttendanceStatus;

import java.time.LocalDateTime;

public record StudentSessionRecordDto(
        String studentId,
        String studentName,
        String studentEmail,
        AttendanceStatus status,
        LocalDateTime markedAt,
        String markedBy,
        StudentInfo student,
        MarkedByInfo markedByDetail
) {}
