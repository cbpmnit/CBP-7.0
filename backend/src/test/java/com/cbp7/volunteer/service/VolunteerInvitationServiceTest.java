package com.cbp7.volunteer.service;

import com.cbp7.auth.entity.Role;
import com.cbp7.auth.entity.User;
import com.cbp7.auth.repository.UserRepository;
import com.cbp7.common.config.FrontendProperties;
import com.cbp7.common.exception.InvalidCredentialsException;
import com.cbp7.notification.email.EmailSender;
import com.cbp7.volunteer.dto.request.*;
import com.cbp7.volunteer.dto.response.*;
import com.cbp7.volunteer.entity.VolunteerInvitation;
import com.cbp7.volunteer.entity.VolunteerInvitationStatus;
import com.cbp7.volunteer.helper.VolunteerAccountProvisioner;
import com.cbp7.volunteer.helper.VolunteerCsvExporter;
import com.cbp7.volunteer.helper.VolunteerEmailHelper;
import com.cbp7.volunteer.mapper.VolunteerMapper;
import com.cbp7.volunteer.repository.VolunteerInvitationRepository;
import com.cbp7.volunteer.resolver.VolunteerIdentityResolver;
import com.cbp7.volunteer.validation.VolunteerValidator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.*;
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

    @Mock
    private FrontendProperties frontendProperties;

    private VolunteerInvitationService volunteerInvitationService;

    private InviteVolunteerRequest inviteRequest;

    @BeforeEach
    void setUp() {
        inviteRequest = new InviteVolunteerRequest("volunteer@mnit.ac.in", "John Volunteer", Set.of("ATTENDANCE_SCAN", "ATTENDANCE_VIEW", "STUDENT_VIEW"));
        lenient().when(frontendProperties.buildUrl(anyString())).thenAnswer(i -> "http://localhost:3000" + i.getArgument(0));
        lenient().when(frontendProperties.getUrl()).thenReturn("http://localhost:3000");

        VolunteerEmailHelper emailHelper = new VolunteerEmailHelper(emailSender, frontendProperties);
        VolunteerValidator validator = new VolunteerValidator();
        VolunteerMapper mapper = new VolunteerMapper(frontendProperties);
        VolunteerIdentityResolver identityResolver = new VolunteerIdentityResolver(userRepository, invitationRepository);
        VolunteerAccountProvisioner accountProvisioner = new VolunteerAccountProvisioner(userRepository, passwordEncoder);
        VolunteerCsvExporter csvExporter = new VolunteerCsvExporter();

        volunteerInvitationService = new com.cbp7.volunteer.service.impl.VolunteerInvitationServiceImpl(
                invitationRepository,
                userRepository,
                frontendProperties,
                emailHelper,
                validator,
                mapper,
                identityResolver,
                accountProvisioner,
                csvExporter
        );
    }

    @Test
    @DisplayName("Admin inviting new user creates invitation and dispatches email")
    void testInviteVolunteerNewUserSuccess() {
        when(userRepository.findByEmailIgnoreCase("volunteer@mnit.ac.in")).thenReturn(Optional.empty());
        when(invitationRepository.findByEmailIgnoreCase("volunteer@mnit.ac.in")).thenReturn(Optional.empty());
        when(invitationRepository.save(any(VolunteerInvitation.class))).thenAnswer(invocation -> {
            VolunteerInvitation inv = invocation.getArgument(0);
            inv.setId(UUID.randomUUID());
            return inv;
        });

        VolunteerInviteCheckResponse response = volunteerInvitationService.inviteVolunteer(inviteRequest, "admin_user");

        assertThat(response).isNotNull();
        assertThat(response.exists()).isFalse();
        assertThat(response.email()).isEqualTo("volunteer@mnit.ac.in");
        assertThat(response.name()).isEqualTo("John Volunteer");
        assertThat(response.status()).isEqualTo(VolunteerInvitationStatus.PENDING);
        assertThat(response.invitationToken()).isNotEmpty();

        verify(emailSender, times(1)).sendEmail(eq("volunteer@mnit.ac.in"), anyString(), anyString());
    }

    @Test
    @DisplayName("Admin inviting existing user automatically upgrades role to ROLE_VOLUNTEER and persists permissions")
    void testInviteVolunteerExistingUserUpgradesRole() {
        User existingUser = User.builder()
                .id(UUID.randomUUID())
                .studentId("2024ucp1186")
                .name("Existing Student")
                .email("volunteer@mnit.ac.in")
                .role(Role.ROLE_STUDENT)
                .roles(new HashSet<>(List.of(Role.ROLE_STUDENT)))
                .enabled(true)
                .build();

        when(userRepository.findByEmailIgnoreCase("volunteer@mnit.ac.in")).thenReturn(Optional.of(existingUser));
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));
        when(invitationRepository.findByEmailIgnoreCase("volunteer@mnit.ac.in")).thenReturn(Optional.empty());
        when(invitationRepository.save(any(VolunteerInvitation.class))).thenAnswer(i -> i.getArgument(0));

        VolunteerInviteCheckResponse response = volunteerInvitationService.inviteVolunteer(inviteRequest, "admin_user");

        assertThat(response).isNotNull();
        assertThat(response.exists()).isTrue();
        assertThat(response.name()).isEqualTo("Existing Student");
        assertThat(response.email()).isEqualTo("volunteer@mnit.ac.in");
        assertThat(existingUser.getRole()).isEqualTo(Role.ROLE_VOLUNTEER);
        assertThat(existingUser.getRoles()).contains(Role.ROLE_VOLUNTEER);
        assertThat(existingUser.getPermissions()).contains("ATTENDANCE_SCAN", "ATTENDANCE_VIEW", "STUDENT_VIEW");

        verify(emailSender, times(1)).sendEmail(eq("volunteer@mnit.ac.in"), contains("Volunteer Access Granted"), anyString());
    }

    @Test
    @DisplayName("Grant volunteer access to existing user successfully adds role and scopes")
    void testGrantVolunteerAccessToExistingUser() {
        User studentUser = User.builder()
                .id(UUID.randomUUID())
                .studentId("2024ucp1186")
                .name("Existing Student")
                .email("volunteer@mnit.ac.in")
                .role(Role.ROLE_STUDENT)
                .roles(new HashSet<>(List.of(Role.ROLE_STUDENT)))
                .enabled(true)
                .build();

        when(userRepository.findByEmailIgnoreCase("volunteer@mnit.ac.in")).thenReturn(Optional.of(studentUser));
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        GrantVolunteerAccessRequest grantReq = new GrantVolunteerAccessRequest(
                "volunteer@mnit.ac.in",
                "Existing Student",
                Set.of("ATTENDANCE_SCAN", "STUDENT_VIEW"),
                Set.of("Workshop Day 1")
        );

        VolunteerDetailResponse response = volunteerInvitationService.grantVolunteerAccess(grantReq, "admin_user");

        assertThat(response).isNotNull();
        assertThat(studentUser.getRole()).isEqualTo(Role.ROLE_VOLUNTEER);
        assertThat(studentUser.getRoles()).contains(Role.ROLE_VOLUNTEER);
        assertThat(studentUser.getPermissions()).contains("ATTENDANCE_SCAN", "STUDENT_VIEW");

        verify(emailSender, times(1)).sendEmail(eq("volunteer@mnit.ac.in"), contains("Volunteer Access Granted"), anyString());
    }

    @Test
    @DisplayName("Accept invitation for existing user upgrades role and assigns permissions")
    void testAcceptInvitationExistingUser() {
        String token = "valid_token_existing";
        VolunteerInvitation invitation = VolunteerInvitation.builder()
                .id(UUID.randomUUID())
                .email("student@mnit.ac.in")
                .name("Student Person")
                .invitationToken(token)
                .status(VolunteerInvitationStatus.PENDING)
                .expiresAt(LocalDateTime.now().plusHours(12))
                .permissions(Set.of("ATTENDANCE_SCAN", "ATTENDANCE_VIEW", "SESSION_VIEW"))
                .createdBy("admin")
                .build();

        User studentUser = User.builder()
                .id(UUID.randomUUID())
                .studentId("2024ucp1190")
                .name("Student Person")
                .email("student@mnit.ac.in")
                .role(Role.ROLE_STUDENT)
                .roles(new HashSet<>(List.of(Role.ROLE_STUDENT)))
                .enabled(true)
                .build();

        when(invitationRepository.findByInvitationToken(token)).thenReturn(Optional.of(invitation));
        when(userRepository.findByEmailIgnoreCase("student@mnit.ac.in")).thenReturn(Optional.of(studentUser));
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        AcceptVolunteerInvitationRequest request = new AcceptVolunteerInvitationRequest(token, null);
        AcceptVolunteerInvitationResponse response = volunteerInvitationService.acceptInvitation(request);

        assertThat(response).isNotNull();
        assertThat(studentUser.getRole()).isEqualTo(Role.ROLE_VOLUNTEER);
        assertThat(studentUser.getRoles()).contains(Role.ROLE_VOLUNTEER);
        assertThat(studentUser.getPermissions()).contains("ATTENDANCE_SCAN", "SESSION_VIEW");
        assertThat(invitation.getStatus()).isEqualTo(VolunteerInvitationStatus.ACCEPTED);
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
                .permissions(Set.of("ATTENDANCE_SCAN", "ATTENDANCE_VIEW"))
                .createdBy("admin")
                .build();

        when(invitationRepository.findByInvitationToken(token)).thenReturn(Optional.of(invitation));
        when(userRepository.findByEmailIgnoreCase("volunteer@mnit.ac.in")).thenReturn(Optional.empty());
        when(userRepository.existsByStudentId(anyString())).thenReturn(false);
        when(passwordEncoder.encode("secretPassword123")).thenReturn("hashed_secret");
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));

        VolunteerPasswordSetupRequest request = new VolunteerPasswordSetupRequest(token, "secretPassword123", "secretPassword123");
        String message = volunteerInvitationService.setupPassword(request);

        assertThat(message).contains("Volunteer account activated successfully");
        assertThat(invitation.getStatus()).isEqualTo(VolunteerInvitationStatus.ACCEPTED);

        verify(userRepository, times(1)).save(argThat(user ->
                user.getEmail().equals("volunteer@mnit.ac.in") &&
                user.hasRole(Role.ROLE_VOLUNTEER) &&
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
                .expiresAt(LocalDateTime.now().minusHours(2))
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
