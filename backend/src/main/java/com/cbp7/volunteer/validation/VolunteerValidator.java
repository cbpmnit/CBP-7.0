package com.cbp7.volunteer.validation;

import com.cbp7.common.exception.InvalidCredentialsException;
import com.cbp7.volunteer.entity.VolunteerInvitation;
import com.cbp7.volunteer.entity.VolunteerInvitationStatus;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class VolunteerValidator {

    public void validateAcceptance(VolunteerInvitation invitation, String rawPassword, boolean isExistingUser) {
        if (invitation.getStatus() == VolunteerInvitationStatus.ACCEPTED) {
            throw new InvalidCredentialsException("This invitation has already been accepted and activated");
        }

        if (invitation.getStatus() == VolunteerInvitationStatus.REVOKED) {
            throw new InvalidCredentialsException("This volunteer invitation was revoked by the administrator");
        }

        if (invitation.getExpiresAt().isBefore(LocalDateTime.now())) {
            invitation.setStatus(VolunteerInvitationStatus.EXPIRED);
            throw new InvalidCredentialsException("Invitation link has expired. Please request a new invitation from admin");
        }

        if (!isExistingUser && (rawPassword == null || rawPassword.isBlank())) {
            throw new IllegalArgumentException("Password is required for new volunteer account activation");
        }
    }
}
