package com.cbp7.volunteer;

import com.cbp7.common.exception.InvalidCredentialsException;
import com.cbp7.volunteer.entity.VolunteerInvitation;
import com.cbp7.volunteer.entity.VolunteerInvitationStatus;
import com.cbp7.volunteer.validation.VolunteerValidator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class VolunteerValidatorTest {

    private VolunteerValidator validator;

    @BeforeEach
    void setUp() {
        validator = new VolunteerValidator();
    }

    @Test
    void validateAcceptance_AlreadyAccepted_ThrowsInvalidCredentials() {
        VolunteerInvitation inv = VolunteerInvitation.builder()
                .status(VolunteerInvitationStatus.ACCEPTED)
                .expiresAt(LocalDateTime.now().plusDays(1))
                .build();

        assertThrows(InvalidCredentialsException.class, () -> validator.validateAcceptance(inv, "pass", false));
    }

    @Test
    void validateAcceptance_Revoked_ThrowsInvalidCredentials() {
        VolunteerInvitation inv = VolunteerInvitation.builder()
                .status(VolunteerInvitationStatus.REVOKED)
                .expiresAt(LocalDateTime.now().plusDays(1))
                .build();

        assertThrows(InvalidCredentialsException.class, () -> validator.validateAcceptance(inv, "pass", false));
    }

    @Test
    void validateAcceptance_Expired_ThrowsInvalidCredentials() {
        VolunteerInvitation inv = VolunteerInvitation.builder()
                .status(VolunteerInvitationStatus.PENDING)
                .expiresAt(LocalDateTime.now().minusDays(1))
                .build();

        assertThrows(InvalidCredentialsException.class, () -> validator.validateAcceptance(inv, "pass", false));
    }

    @Test
    void validateAcceptance_NewUserMissingPassword_ThrowsIllegalArgument() {
        VolunteerInvitation inv = VolunteerInvitation.builder()
                .status(VolunteerInvitationStatus.PENDING)
                .expiresAt(LocalDateTime.now().plusDays(1))
                .build();

        assertThrows(IllegalArgumentException.class, () -> validator.validateAcceptance(inv, "", false));
        assertThrows(IllegalArgumentException.class, () -> validator.validateAcceptance(inv, null, false));
    }

    @Test
    void validateAcceptance_ValidNewUser_Success() {
        VolunteerInvitation inv = VolunteerInvitation.builder()
                .status(VolunteerInvitationStatus.PENDING)
                .expiresAt(LocalDateTime.now().plusDays(1))
                .build();

        assertDoesNotThrow(() -> validator.validateAcceptance(inv, "strongPassword123", false));
    }
}
