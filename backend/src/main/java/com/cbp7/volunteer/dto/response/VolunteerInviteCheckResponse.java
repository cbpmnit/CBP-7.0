package com.cbp7.volunteer.dto.response;

import com.cbp7.volunteer.entity.VolunteerInvitationStatus;
import java.time.LocalDateTime;
import java.util.Set;
import java.util.UUID;

public record VolunteerInviteCheckResponse(
    boolean exists,
    String userId,
    String name,
    String email,
    Set<String> currentRoles,
    Set<String> currentPermissions,
    UUID invitationId,
    String invitationToken,
    VolunteerInvitationStatus status,
    LocalDateTime expiresAt,
    String activationLink,
    String message
) {}
