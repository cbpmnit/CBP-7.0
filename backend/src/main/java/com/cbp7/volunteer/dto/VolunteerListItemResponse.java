package com.cbp7.volunteer.dto;

import java.time.LocalDateTime;
import java.util.Set;

public record VolunteerListItemResponse(
        String id,
        String name,
        String email,
        String role,
        String status,
        Set<String> permissions,
        Set<String> assignedSessions,
        LocalDateTime createdAt,
        LocalDateTime lastLogin
) {
    public VolunteerListItemResponse(String id, String name, String email, String role, String status, LocalDateTime createdAt) {
        this(id, name, email, role, status, Set.of("ATTENDANCE_SCAN"), Set.of(), createdAt, null);
    }
}
