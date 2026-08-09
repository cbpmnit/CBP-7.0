package com.cbp7.volunteer.dto;

import jakarta.validation.constraints.NotBlank;

public record AcceptVolunteerInvitationRequest(
        @NotBlank(message = "Invitation token is required")
        String token,
        String password
) {}
