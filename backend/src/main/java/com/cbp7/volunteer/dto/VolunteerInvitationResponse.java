package com.cbp7.volunteer.dto;

import com.cbp7.volunteer.entity.VolunteerInvitationStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public record VolunteerInvitationResponse(
        UUID id,
        String email,
        String name,
        String invitationToken,
        VolunteerInvitationStatus status,
        LocalDateTime expiresAt,
        String activationLink
) {}
