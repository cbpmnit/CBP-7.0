package com.cbp7.program.attendance.record.dto.response;

import com.cbp7.program.attendance.record.dto.common.SessionAttendanceStatusDto;

import java.util.List;

public record StudentAttendanceSummaryResponse(
        String studentId,
        long totalSessions,
        long attendedSessions,
        double attendancePercentage,
        List<SessionAttendanceStatusDto> sessions
) {
    public double percentage() {
        return attendancePercentage;
    }

    public long totalClasses() {
        return totalSessions;
    }

    public long present() {
        return attendedSessions;
    }

    public List<SessionAttendanceStatusDto> records() {
        return sessions;
    }
}
