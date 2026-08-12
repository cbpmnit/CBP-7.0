package com.cbp7.platform.volunteer.dto.request;

import jakarta.validation.constraints.NotBlank;

public record AcceptVolunteerInvitationRequest(
        @NotBlank(message = "Invitation token is required")
        String token,
        String password
) {}
