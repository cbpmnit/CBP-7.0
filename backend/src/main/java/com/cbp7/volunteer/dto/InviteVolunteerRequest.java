package com.cbp7.volunteer.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record InviteVolunteerRequest(
        @NotBlank(message = "Volunteer email is required")
        @Email(message = "Please provide a valid email address")
        String email,

        String name
) {}
