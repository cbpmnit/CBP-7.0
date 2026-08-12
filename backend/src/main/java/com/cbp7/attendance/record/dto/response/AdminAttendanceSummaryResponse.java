package com.cbp7.attendance.record.dto.response;

public record AdminAttendanceSummaryResponse(
        long totalRegisteredStudents,
        long totalAttendanceToday,
        double attendancePercentage
) {}
