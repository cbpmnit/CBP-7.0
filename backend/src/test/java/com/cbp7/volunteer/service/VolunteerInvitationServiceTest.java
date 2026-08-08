package com.cbp7.volunteer.service;

import com.cbp7.auth.entity.Role;
import com.cbp7.auth.entity.User;
import com.cbp7.auth.repository.UserRepository;
import com.cbp7.common.exception.DuplicateResourceException;
import com.cbp7.common.exception.InvalidCredentialsException;
import com.cbp7.notification.email.EmailSender;
import com.cbp7.volunteer.dto.*;
import com.cbp7.volunteer.entity.VolunteerInvitation;
import com.cbp7.volunteer.entity.VolunteerInvitationStatus;
import com.cbp7.volunteer.repository.VolunteerInvitationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class VolunteerInvitationServiceTest {

    @Mock
    private VolunteerInvitationRepository invitationRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private EmailSender emailSender;

    @InjectMocks
    private VolunteerInvitationService volunteerInvitationService;

    private InviteVolunteerRequest inviteRequest;

    @BeforeEach
    void setUp() {
        inviteRequest = new InviteVolunteerRequest("volunteer@mnit.ac.in", "John Volunteer");
    }

    @Test
    @DisplayName("Admin can invite volunteer successfully and dispatch email")
    void testInviteVolunteerSuccess() {
        when(userRepository.existsByEmail("volunteer@mnit.ac.in")).thenReturn(false);
        when(invitationRepository.findByEmailIgnoreCase("volunteer@mnit.ac.in")).thenReturn(Optional.empty());
        when(invitationRepository.save(any(VolunteerInvitation.class))).thenAnswer(invocation -> {
            VolunteerInvitation inv = invocation.getArgument(0);
            inv.setId(UUID.randomUUID());
            return inv;
        });

        VolunteerInvitationResponse response = volunteerInvitationService.inviteVolunteer(inviteRequest, "admin_user");

        assertThat(response).isNotNull();
        assertThat(response.email()).isEqualTo("volunteer@mnit.ac.in");
        assertThat(response.name()).isEqualTo("John Volunteer");
        assertThat(response.status()).isEqualTo(VolunteerInvitationStatus.PENDING);
        assertThat(response.invitationToken()).isNotEmpty();

        verify(emailSender, times(1)).sendEmail(eq("volunteer@mnit.ac.in"), anyString(), anyString());
    }

    @Test
    @DisplayName("Invite fails if user account already exists with email")
    void testInviteFailsWhenUserExists() {
        when(userRepository.existsByEmail("volunteer@mnit.ac.in")).thenReturn(true);

        assertThatThrownBy(() -> volunteerInvitationService.inviteVolunteer(inviteRequest, "admin_user"))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("already exists");

        verify(invitationRepository, never()).save(any());
        verify(emailSender, never()).sendEmail(anyString(), anyString(), anyString());
    }

    @Test
    @DisplayName("Valid invitation token allows password setup and creates volunteer account")
    void testSetupPasswordSuccess() {
        String token = "valid_token_12345";
        VolunteerInvitation invitation = VolunteerInvitation.builder()
                .id(UUID.randomUUID())
                .email("volunteer@mnit.ac.in")
                .name("John Volunteer")
                .invitationToken(token)
                .status(VolunteerInvitationStatus.PENDING)
                .expiresAt(LocalDateTime.now().plusHours(12))
                .createdBy("admin")
                .build();

        when(invitationRepository.findByInvitationToken(token)).thenReturn(Optional.of(invitation));
        when(userRepository.existsByStudentId(anyString())).thenReturn(false);
        when(passwordEncoder.encode("secretPassword123")).thenReturn("hashed_secret");

        VolunteerPasswordSetupRequest request = new VolunteerPasswordSetupRequest(token, "secretPassword123", "secretPassword123");
        String message = volunteerInvitationService.setupPassword(request);

        assertThat(message).contains("Volunteer account activated successfully");
        assertThat(invitation.getStatus()).isEqualTo(VolunteerInvitationStatus.ACCEPTED);

        verify(userRepository, times(1)).save(argThat(user ->
                user.getEmail().equals("volunteer@mnit.ac.in") &&
                user.getRole() == Role.ROLE_VOLUNTEER &&
                user.getEnabled()
        ));
        verify(invitationRepository, times(1)).save(invitation);
    }

    @Test
    @DisplayName("Expired token is rejected during password setup")
    void testExpiredTokenRejected() {
        String token = "expired_token_12345";
        VolunteerInvitation invitation = VolunteerInvitation.builder()
                .id(UUID.randomUUID())
                .email("volunteer@mnit.ac.in")
                .name("John Volunteer")
                .invitationToken(token)
                .status(VolunteerInvitationStatus.PENDING)
                .expiresAt(LocalDateTime.now().minusHours(2)) // expired
                .createdBy("admin")
                .build();

        when(invitationRepository.findByInvitationToken(token)).thenReturn(Optional.of(invitation));

        VolunteerPasswordSetupRequest request = new VolunteerPasswordSetupRequest(token, "secretPassword123", "secretPassword123");

        assertThatThrownBy(() -> volunteerInvitationService.setupPassword(request))
                .isInstanceOf(InvalidCredentialsException.class)
                .hasMessageContaining("expired");

        assertThat(invitation.getStatus()).isEqualTo(VolunteerInvitationStatus.EXPIRED);
        verify(userRepository, never()).save(any());
    }

    @Test
    @DisplayName("Verify invitation checks token status and expiration")
    void testVerifyInvitation() {
        String token = "check_token_123";
        VolunteerInvitation invitation = VolunteerInvitation.builder()
                .id(UUID.randomUUID())
                .email("test@mnit.ac.in")
                .name("Test User")
                .invitationToken(token)
                .status(VolunteerInvitationStatus.PENDING)
                .expiresAt(LocalDateTime.now().plusHours(5))
                .build();

        when(invitationRepository.findByInvitationToken(token)).thenReturn(Optional.of(invitation));

        VerifyInvitationResponse response = volunteerInvitationService.verifyInvitation(token);

        assertThat(response.valid()).isTrue();
        assertThat(response.email()).isEqualTo("test@mnit.ac.in");
        assertThat(response.name()).isEqualTo("Test User");
    }
}
