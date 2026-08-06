package com.cbp7.attendance.record.dto;

import java.util.List;

public record StudentAttendanceSummaryResponse(
        String studentId,
        long totalClasses,
        long present,
        double percentage,
        List<AttendanceRecordResponse> records
) {
}
