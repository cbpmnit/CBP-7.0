package com.cbp7.program.attendance.record.dto.response;

import com.cbp7.program.attendance.record.dto.common.SessionAttendanceDetailDto;

import java.util.List;

public record StudentAttendanceProfileResponse(
        String name,
        String studentId,
        String email,
        String phoneNumber,
        String branch,
        Integer year,
        String registrationDate,
        String paymentStatus,
        String certificateStatus,
        long totalSessions,
        long presentCount,
        long absentCount,
        double attendancePercentage,
        List<SessionAttendanceDetailDto> attendanceHistory
) {}
