package com.cbp7.attendance.record.dto;

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
