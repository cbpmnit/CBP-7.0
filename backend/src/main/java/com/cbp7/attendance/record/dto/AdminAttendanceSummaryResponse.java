package com.cbp7.attendance.record.dto;

public record AdminAttendanceSummaryResponse(
        long totalRegisteredStudents,
        long totalAttendanceToday,
        double attendancePercentage
) {
}
