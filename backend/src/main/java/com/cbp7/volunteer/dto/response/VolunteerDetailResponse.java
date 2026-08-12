package com.cbp7.volunteer.dto.response;

import java.time.LocalDateTime;
import java.util.Set;

public record VolunteerDetailResponse(
        String id,
        String name,
        String email,
        String phoneNumber,
        String role,
        String status,
        Set<String> permissions,
        Set<String> assignedSessions,
        LocalDateTime createdAt,
        LocalDateTime lastLogin,
        String activationLink
) {}
