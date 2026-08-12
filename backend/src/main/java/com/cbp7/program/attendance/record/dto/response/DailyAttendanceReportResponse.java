package com.cbp7.program.attendance.record.dto.response;

import java.time.LocalDate;
import java.util.List;

public record DailyAttendanceReportResponse(
        LocalDate date,
        long totalPresent,
        List<AttendanceRecordResponse> records
) {}
