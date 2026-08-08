package com.cbp7.volunteer.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record VolunteerPasswordSetupRequest(
        @NotBlank(message = "Invitation token is required")
        String token,

        @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        String password,

        String confirmPassword
) {}
