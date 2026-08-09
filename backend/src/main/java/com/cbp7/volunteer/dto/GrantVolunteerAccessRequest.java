package com.cbp7.volunteer.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.Set;

public record GrantVolunteerAccessRequest(
    @NotBlank(message = "User ID or Email is required")
    String userIdOrEmail,
    String name,
    Set<String> permissions,
    Set<String> assignedSessions
) {}
