package com.cbp7.volunteer.dto.response;

import com.cbp7.volunteer.entity.VolunteerInvitationStatus;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

public record VolunteerInvitationResponse(
        UUID id,
        String email,
        String name,
        String invitationToken,
        VolunteerInvitationStatus status,
        LocalDateTime createdAt,
        LocalDateTime expiresAt,
        LocalDateTime emailSentAt,
        LocalDateTime acceptedAt,
        String emailDeliveryStatus,
        String emailFailureReason,
        Set<String> permissions,
        String activationLink,
        String createdBy
) {
    public VolunteerInvitationResponse(
            UUID id,
            String email,
            String name,
            String invitationToken,
            VolunteerInvitationStatus status,
            LocalDateTime expiresAt,
            String activationLink
    ) {
        this(id, email, name, invitationToken, status, LocalDateTime.now(), expiresAt, LocalDateTime.now(), null, "SENT", null, Set.of("ATTENDANCE_SCAN", "ATTENDANCE_VIEW"), activationLink, "admin");
    }
}
