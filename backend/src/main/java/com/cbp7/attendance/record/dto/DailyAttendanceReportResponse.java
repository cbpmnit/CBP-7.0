package com.cbp7.attendance.record.dto;

import java.time.LocalDate;
import java.util.List;

public record DailyAttendanceReportResponse(
        LocalDate date,
        long totalPresent,
        List<AttendanceRecordResponse> records
) {
}
