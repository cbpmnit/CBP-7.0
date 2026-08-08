package com.cbp7.volunteer.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.util.Set;

public record InviteVolunteerRequest(
        @NotBlank(message = "Volunteer email is required")
        @Email(message = "Please provide a valid email address")
        String email,

        String name,

        Set<String> permissions,

        Set<String> assignedSessions
) {
    public InviteVolunteerRequest(String email, String name) {
        this(email, name, Set.of("ATTENDANCE_SCAN", "ATTENDANCE_VIEW"), Set.of());
    }
}
