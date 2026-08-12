package com.cbp7.attendance.record.dto.response;

import com.cbp7.attendance.record.dto.common.UserActivityDto;

import java.util.List;

public record UserAttendanceProfileResponse(
        String name,
        String email,
        String role,
        List<String> permissions,
        List<UserActivityDto> recentActivities
) {}
