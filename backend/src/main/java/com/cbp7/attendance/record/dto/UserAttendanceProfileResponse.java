package com.cbp7.attendance.record.dto;

import java.util.List;

public record UserAttendanceProfileResponse(
        String name,
        String email,
        String role,
        List<String> permissions,
        List<UserActivityDto> recentActivities
) {}
