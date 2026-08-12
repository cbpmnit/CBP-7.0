package com.cbp7.volunteer.mapper;

import com.cbp7.auth.entity.Role;
import com.cbp7.auth.entity.User;
import com.cbp7.common.config.FrontendProperties;
import com.cbp7.volunteer.dto.response.AcceptVolunteerInvitationResponse;
import com.cbp7.volunteer.dto.response.VolunteerDetailResponse;
import com.cbp7.volunteer.dto.response.VolunteerInvitationResponse;
import com.cbp7.volunteer.dto.response.VolunteerInviteCheckResponse;
import com.cbp7.volunteer.dto.response.VolunteerListItemResponse;
import com.cbp7.volunteer.entity.VolunteerInvitation;
import com.cbp7.volunteer.entity.VolunteerInvitationStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class VolunteerMapper {

    private final FrontendProperties frontendProperties;

    public VolunteerInviteCheckResponse toExistingUserInviteResponse(User user, VolunteerInvitation invitation, Set<String> perms) {
        Set<String> currentRoles = user.getRoles() != null
                ? user.getRoles().stream().map(Enum::name).collect(Collectors.toSet())
                : Set.of("ROLE_VOLUNTEER");

        return new VolunteerInviteCheckResponse(
                true,
                user.getId() != null ? user.getId().toString() : user.getStudentId(),
                user.getName(),
                user.getEmail(),
                currentRoles,
                user.getPermissions() != null ? user.getPermissions() : perms,
                invitation.getId(),
                invitation.getInvitationToken(),
                invitation.getStatus(),
                invitation.getExpiresAt(),
                null,
                "Existing user account upgraded to ROLE_VOLUNTEER with assigned permissions."
        );
    }

    public VolunteerInviteCheckResponse toNewUserInviteResponse(VolunteerInvitation invitation, String activationLink, boolean emailSent) {
        return new VolunteerInviteCheckResponse(
                false,
                null,
                invitation.getName(),
                invitation.getEmail(),
                Set.of(),
                invitation.getPermissions(),
                invitation.getId(),
                invitation.getInvitationToken(),
                invitation.getStatus(),
                invitation.getExpiresAt(),
                activationLink,
                emailSent ? "Volunteer invitation created and email sent successfully." : "Invitation created but email delivery failed. You can retry sending from Pending Invitations."
        );
    }

    public VolunteerDetailResponse toVolunteerDetailResponse(User user, Set<String> defaultPerms, Set<String> assignedSessions) {
        String status = Boolean.TRUE.equals(user.getEnabled()) ? "ACTIVE" : "DISABLED";
        Set<String> perms = user.getPermissions() != null && !user.getPermissions().isEmpty()
                ? user.getPermissions()
                : new HashSet<>(defaultPerms);

        return new VolunteerDetailResponse(
                user.getId() != null ? user.getId().toString() : user.getStudentId(),
                user.getName(),
                user.getEmail(),
                user.getPhoneNumber() != null ? user.getPhoneNumber() : "",
                user.getRole() != null ? user.getRole().name() : "ROLE_VOLUNTEER",
                status,
                perms,
                assignedSessions != null ? assignedSessions : Set.of("All Active Workshop Sessions"),
                user.getCreatedAt() != null ? user.getCreatedAt() : LocalDateTime.now(),
                user.getUpdatedAt(),
                null
        );
    }

    public VolunteerDetailResponse toVolunteerDetailResponse(VolunteerInvitation inv, Set<String> defaultPerms) {
        VolunteerInvitationStatus currentStatus = inv.getStatus();
        if (currentStatus == VolunteerInvitationStatus.PENDING && inv.getExpiresAt().isBefore(LocalDateTime.now())) {
            currentStatus = VolunteerInvitationStatus.EXPIRED;
        }

        String activationLink = frontendProperties.buildUrl("/volunteer/setup-password?token=" + inv.getInvitationToken());

        return new VolunteerDetailResponse(
                inv.getId().toString(),
                inv.getName() != null ? inv.getName() : inv.getEmail().split("@")[0],
                inv.getEmail(),
                "",
                "ROLE_VOLUNTEER",
                currentStatus.name(),
                inv.getPermissions() != null && !inv.getPermissions().isEmpty() ? inv.getPermissions() : defaultPerms,
                Set.of("Gate Access Verification"),
                inv.getCreatedAt() != null ? inv.getCreatedAt() : LocalDateTime.now(),
                null,
                activationLink
        );
    }

    public VolunteerInvitationResponse toVolunteerInvitationResponse(VolunteerInvitation inv, Set<String> defaultPerms) {
        VolunteerInvitationStatus currentStatus = inv.getStatus();
        if (currentStatus == VolunteerInvitationStatus.PENDING && inv.getExpiresAt().isBefore(LocalDateTime.now())) {
            currentStatus = VolunteerInvitationStatus.EXPIRED;
        }

        String activationLink = frontendProperties.buildUrl("/volunteer/setup-password?token=" + inv.getInvitationToken());

        return new VolunteerInvitationResponse(
                inv.getId(),
                inv.getEmail(),
                inv.getName() != null ? inv.getName() : inv.getEmail().split("@")[0],
                inv.getInvitationToken(),
                currentStatus,
                inv.getCreatedAt(),
                inv.getExpiresAt(),
                inv.getEmailSentAt() != null ? inv.getEmailSentAt() : inv.getCreatedAt(),
                inv.getAcceptedAt(),
                inv.getEmailDeliveryStatus() != null ? inv.getEmailDeliveryStatus() : "SENT",
                inv.getEmailFailureReason(),
                inv.getPermissions() != null ? inv.getPermissions() : defaultPerms,
                activationLink,
                inv.getCreatedBy() != null ? inv.getCreatedBy() : "Admin"
        );
    }

    public VolunteerListItemResponse toVolunteerListItemResponse(User user, Set<String> defaultPerms) {
        String status = Boolean.TRUE.equals(user.getEnabled()) ? "ACTIVE" : "DISABLED";
        Set<String> perms = user.getPermissions() != null && !user.getPermissions().isEmpty()
                ? user.getPermissions()
                : new HashSet<>(defaultPerms);

        return new VolunteerListItemResponse(
                user.getId() != null ? user.getId().toString() : user.getStudentId(),
                user.getName(),
                user.getEmail(),
                user.getRole() != null ? user.getRole().name() : "ROLE_VOLUNTEER",
                status,
                perms,
                Set.of("All Workshop Sessions"),
                user.getCreatedAt() != null ? user.getCreatedAt() : LocalDateTime.now(),
                user.getUpdatedAt()
        );
    }

    public AcceptVolunteerInvitationResponse toAcceptInvitationResponse(User user) {
        return new AcceptVolunteerInvitationResponse(
                user.getEmail(),
                user.getName(),
                user.getRole() != null ? user.getRole().name() : "ROLE_VOLUNTEER",
                user.getPermissions(),
                "Volunteer account activated successfully! You can now log in."
        );
    }
}
