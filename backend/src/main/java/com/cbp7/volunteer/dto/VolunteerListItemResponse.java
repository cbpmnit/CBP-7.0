package com.cbp7.volunteer.dto;

import java.time.LocalDateTime;

public record VolunteerListItemResponse(
        String id,
        String name,
        String email,
        String role,
        String status,
        LocalDateTime createdAt
) {}
