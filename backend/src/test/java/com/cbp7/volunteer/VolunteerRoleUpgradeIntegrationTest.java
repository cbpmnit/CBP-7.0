package com.cbp7.volunteer;

import com.cbp7.auth.dto.LoginRequest;
import com.cbp7.auth.dto.LoginResponse;
import com.cbp7.auth.entity.Role;
import com.cbp7.auth.entity.User;
import com.cbp7.auth.repository.UserRepository;
import com.cbp7.auth.security.JwtProvider;
import com.cbp7.auth.service.AuthService;
import com.cbp7.volunteer.dto.AcceptVolunteerInvitationRequest;
import com.cbp7.volunteer.dto.AcceptVolunteerInvitationResponse;
import com.cbp7.volunteer.dto.GrantVolunteerAccessRequest;
import com.cbp7.volunteer.dto.InviteVolunteerRequest;
import com.cbp7.volunteer.dto.VolunteerDetailResponse;
import com.cbp7.volunteer.dto.VolunteerInviteCheckResponse;
import com.cbp7.volunteer.entity.VolunteerInvitation;
import com.cbp7.volunteer.entity.VolunteerInvitationStatus;
import com.cbp7.volunteer.repository.VolunteerInvitationRepository;
import com.cbp7.volunteer.service.VolunteerInvitationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class VolunteerRoleUpgradeIntegrationTest {

    @Autowired
    private VolunteerInvitationService volunteerInvitationService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VolunteerInvitationRepository invitationRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuthService authService;

    @Autowired
    private JwtProvider jwtProvider;

    @BeforeEach
    void cleanDb() {
        invitationRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("Case 1: Existing student invited as volunteer -> role upgraded to ROLE_VOLUNTEER and permissions persisted")
    void testExistingStudentUpgradeToVolunteer() {
        // 1. Create existing student user
        User student = User.builder()
                .studentId("2024ucp1001")
                .name("Alice Student")
                .email("alice@mnit.ac.in")
                .password(passwordEncoder.encode("StudentPass123"))
                .role(Role.ROLE_STUDENT)
                .roles(new HashSet<>(List.of(Role.ROLE_STUDENT)))
                .enabled(true)
                .build();
        userRepository.save(student);

        // 2. Admin invites existing user
        Set<String> scopes = Set.of("ATTENDANCE_SCAN", "ATTENDANCE_VIEW", "STUDENT_VIEW", "SESSION_VIEW");
        InviteVolunteerRequest request = new InviteVolunteerRequest("alice@mnit.ac.in", "Alice Student", scopes);
        VolunteerInviteCheckResponse inviteRes = volunteerInvitationService.inviteVolunteer(request, "admin_user");

        assertThat(inviteRes.exists()).isTrue();

        // 3. Verify user in database
        User updatedUser = userRepository.findByEmailIgnoreCase("alice@mnit.ac.in").orElseThrow();
        assertThat(updatedUser.getRole()).isEqualTo(Role.ROLE_VOLUNTEER);
        assertThat(updatedUser.getRoles()).contains(Role.ROLE_VOLUNTEER);
        assertThat(updatedUser.getPermissions()).contains("ATTENDANCE_SCAN", "STUDENT_VIEW", "SESSION_VIEW");

        // 4. Verify login returns ROLE_VOLUNTEER and JWT contains permissions
        LoginResponse loginRes = authService.login(new LoginRequest(null, "alice@mnit.ac.in", "StudentPass123"));
        assertThat(loginRes.role()).isEqualTo("ROLE_VOLUNTEER");
        assertThat(loginRes.permissions()).contains("ATTENDANCE_SCAN", "STUDENT_VIEW");

        List<String> jwtPerms = jwtProvider.extractPermissions(loginRes.token());
        assertThat(jwtPerms).contains("ATTENDANCE_SCAN", "STUDENT_VIEW");
        List<String> jwtRoles = jwtProvider.extractRoles(loginRes.token());
        assertThat(jwtRoles).contains("ROLE_VOLUNTEER");
    }

    @Test
    @DisplayName("Case 2: New volunteer invitation and acceptance -> user created with ROLE_VOLUNTEER and permissions")
    void testNewVolunteerInvitationAndAcceptance() {
        // 1. Admin sends invitation for new email
        Set<String> scopes = Set.of("ATTENDANCE_SCAN", "ATTENDANCE_VIEW", "PAYMENT_VIEW");
        InviteVolunteerRequest request = new InviteVolunteerRequest("newvol@mnit.ac.in", "Bob NewVol", scopes);
        VolunteerInviteCheckResponse inviteRes = volunteerInvitationService.inviteVolunteer(request, "admin_user");

        assertThat(inviteRes.exists()).isFalse();
        String token = inviteRes.invitationToken();
        assertThat(token).isNotBlank();

        // 2. Volunteer accepts invitation and sets password
        AcceptVolunteerInvitationRequest acceptReq = new AcceptVolunteerInvitationRequest(token, "SecureVolPassword123");
        AcceptVolunteerInvitationResponse acceptRes = volunteerInvitationService.acceptInvitation(acceptReq);

        assertThat(acceptRes.role()).isEqualTo("ROLE_VOLUNTEER");
        assertThat(acceptRes.permissions()).contains("ATTENDANCE_SCAN", "PAYMENT_VIEW");

        // 3. Verify user in DB
        User createdUser = userRepository.findByEmailIgnoreCase("newvol@mnit.ac.in").orElseThrow();
        assertThat(createdUser.getRole()).isEqualTo(Role.ROLE_VOLUNTEER);
        assertThat(createdUser.getRoles()).contains(Role.ROLE_VOLUNTEER);
        assertThat(createdUser.getPermissions()).contains("ATTENDANCE_SCAN", "PAYMENT_VIEW");

        // 4. Verify login
        LoginResponse loginRes = authService.login(new LoginRequest(null, "newvol@mnit.ac.in", "SecureVolPassword123"));
        assertThat(loginRes.role()).isEqualTo("ROLE_VOLUNTEER");
        assertThat(loginRes.permissions()).contains("ATTENDANCE_SCAN", "PAYMENT_VIEW");

        List<String> jwtPerms = jwtProvider.extractPermissions(loginRes.token());
        assertThat(jwtPerms).contains("ATTENDANCE_SCAN", "PAYMENT_VIEW");
    }

    @Test
    @DisplayName("Admin grant access directly upgrades existing student to volunteer")
    void testGrantVolunteerAccessDirectly() {
        User student = User.builder()
                .studentId("2024ucp1002")
                .name("Charlie Student")
                .email("charlie@mnit.ac.in")
                .password(passwordEncoder.encode("StudentPass456"))
                .role(Role.ROLE_STUDENT)
                .roles(new HashSet<>(List.of(Role.ROLE_STUDENT)))
                .enabled(true)
                .build();
        userRepository.save(student);

        GrantVolunteerAccessRequest grantReq = new GrantVolunteerAccessRequest(
                "charlie@mnit.ac.in",
                "Charlie Student",
                Set.of("ATTENDANCE_SCAN", "ATTENDANCE_VIEW", "EMAIL_SEND"),
                Set.of("Session 1")
        );

        VolunteerDetailResponse res = volunteerInvitationService.grantVolunteerAccess(grantReq, "admin_user");
        assertThat(res.role()).isEqualTo("ROLE_VOLUNTEER");
        assertThat(res.permissions()).contains("EMAIL_SEND", "ATTENDANCE_SCAN");

        User updatedUser = userRepository.findByEmailIgnoreCase("charlie@mnit.ac.in").orElseThrow();
        assertThat(updatedUser.getRole()).isEqualTo(Role.ROLE_VOLUNTEER);
        assertThat(updatedUser.getPermissions()).contains("EMAIL_SEND", "ATTENDANCE_SCAN");
    }
}
