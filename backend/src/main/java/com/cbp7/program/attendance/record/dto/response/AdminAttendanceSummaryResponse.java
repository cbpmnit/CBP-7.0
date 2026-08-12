package com.cbp7.program.attendance.record.dto.response;

public record AdminAttendanceSummaryResponse(
        long totalRegisteredStudents,
        long totalAttendanceToday,
        double attendancePercentage
) {}
