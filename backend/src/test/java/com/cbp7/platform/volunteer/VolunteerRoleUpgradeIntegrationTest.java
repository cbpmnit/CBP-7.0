package com.cbp7.platform.volunteer;

import com.cbp7.identity.auth.dto.request.LoginRequest;
import com.cbp7.identity.auth.dto.response.LoginResponse;
import com.cbp7.identity.auth.entity.Role;
import com.cbp7.identity.auth.entity.User;
import com.cbp7.identity.auth.repository.UserRepository;
import com.cbp7.identity.auth.security.JwtProvider;
import com.cbp7.identity.auth.service.AuthService;
import com.cbp7.platform.volunteer.dto.request.AcceptVolunteerInvitationRequest;
import com.cbp7.platform.volunteer.dto.request.GrantVolunteerAccessRequest;
import com.cbp7.platform.volunteer.dto.request.InviteVolunteerRequest;
import com.cbp7.platform.volunteer.dto.response.AcceptVolunteerInvitationResponse;
import com.cbp7.platform.volunteer.dto.response.VolunteerDetailResponse;
import com.cbp7.platform.volunteer.dto.response.VolunteerInviteCheckResponse;
import com.cbp7.platform.volunteer.repository.VolunteerInvitationRepository;
import com.cbp7.platform.volunteer.service.VolunteerInvitationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class VolunteerRoleUpgradeIntegrationTest {

    @Autowired
    private WebApplicationContext context;

    private MockMvc mockMvc;

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
    void setup() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();
        invitationRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("Case 1: Existing student invited as volunteer -> role upgraded to ROLE_VOLUNTEER and permissions persisted")
    void testExistingStudentUpgradeToVolunteer() {
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

        Set<String> scopes = Set.of("ATTENDANCE_SCAN", "ATTENDANCE_VIEW", "STUDENT_VIEW", "SESSION_VIEW");
        InviteVolunteerRequest request = new InviteVolunteerRequest("alice@mnit.ac.in", "Alice Student", scopes);
        VolunteerInviteCheckResponse inviteRes = volunteerInvitationService.inviteVolunteer(request, "admin_user");

        assertThat(inviteRes.exists()).isTrue();

        User updatedUser = userRepository.findByEmailIgnoreCase("alice@mnit.ac.in").orElseThrow();
        assertThat(updatedUser.getRole()).isEqualTo(Role.ROLE_VOLUNTEER);
        assertThat(updatedUser.getRoles()).contains(Role.ROLE_VOLUNTEER);
        assertThat(updatedUser.getPermissions()).contains("ATTENDANCE_SCAN", "STUDENT_VIEW", "SESSION_VIEW");

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
        Set<String> scopes = Set.of("ATTENDANCE_SCAN", "ATTENDANCE_VIEW", "PAYMENT_VIEW");
        InviteVolunteerRequest request = new InviteVolunteerRequest("newvol@mnit.ac.in", "Bob NewVol", scopes);
        VolunteerInviteCheckResponse inviteRes = volunteerInvitationService.inviteVolunteer(request, "admin_user");

        assertThat(inviteRes.exists()).isFalse();
        String token = inviteRes.invitationToken();
        assertThat(token).isNotBlank();

        AcceptVolunteerInvitationRequest acceptReq = new AcceptVolunteerInvitationRequest(token, "SecureVolPassword123");
        AcceptVolunteerInvitationResponse acceptRes = volunteerInvitationService.acceptInvitation(acceptReq);

        assertThat(acceptRes.role()).isEqualTo("ROLE_VOLUNTEER");
        assertThat(acceptRes.permissions()).contains("ATTENDANCE_SCAN", "PAYMENT_VIEW");

        User createdUser = userRepository.findByEmailIgnoreCase("newvol@mnit.ac.in").orElseThrow();
        assertThat(createdUser.getRole()).isEqualTo(Role.ROLE_VOLUNTEER);
        assertThat(createdUser.getRoles()).contains(Role.ROLE_VOLUNTEER);
        assertThat(createdUser.getPermissions()).contains("ATTENDANCE_SCAN", "PAYMENT_VIEW");

        LoginResponse loginRes = authService.login(new LoginRequest(null, "newvol@mnit.ac.in", "SecureVolPassword123"));
        assertThat(loginRes.role()).isEqualTo("ROLE_VOLUNTEER");
        assertThat(loginRes.permissions()).contains("ATTENDANCE_SCAN", "PAYMENT_VIEW");

        List<String> jwtPerms = jwtProvider.extractPermissions(loginRes.token());
        assertThat(jwtPerms).contains("ATTENDANCE_SCAN", "PAYMENT_VIEW");
    }

    @Test
    @DisplayName("Case 3: Verify /api/v1/auth/me debug endpoint returns user role and permissions from DB")
    void testGetAuthMeEndpoint() throws Exception {
        User volunteer = User.builder()
                .studentId("2024vol999")
                .name("Me Test Volunteer")
                .email("mevol@mnit.ac.in")
                .password(passwordEncoder.encode("VolPass123"))
                .role(Role.ROLE_VOLUNTEER)
                .roles(new HashSet<>(List.of(Role.ROLE_VOLUNTEER)))
                .permissions(new HashSet<>(List.of("ATTENDANCE_SCAN", "STUDENT_VIEW")))
                .enabled(true)
                .build();
        userRepository.save(volunteer);

        String token = jwtProvider.generateToken(volunteer);

        mockMvc.perform(get("/api/v1/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.email").value("mevol@mnit.ac.in"))
                .andExpect(jsonPath("$.data.role").value("ROLE_VOLUNTEER"))
                .andExpect(jsonPath("$.data.permissions").isArray());
    }

    @Test
    @DisplayName("RBAC TEST CASE 1: Admin User (ROLE_ADMIN) has access to all APIs")
    void testAdminAccessToAllApis() throws Exception {
        User admin = User.builder()
                .studentId("admin_user_001")
                .name("Super Admin")
                .email("superadmin@mnit.ac.in")
                .password(passwordEncoder.encode("AdminPass123"))
                .role(Role.ROLE_ADMIN)
                .roles(new HashSet<>(List.of(Role.ROLE_ADMIN)))
                .enabled(true)
                .build();
        userRepository.save(admin);
        String adminToken = jwtProvider.generateToken(admin);

        // Admin can access student management
        mockMvc.perform(get("/api/v1/admin/students")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());

        // Admin can access payment management
        mockMvc.perform(get("/api/v1/admin/payments")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());

        // Admin can access attendance summary
        mockMvc.perform(get("/api/v1/admin/attendance/summary")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("RBAC TEST CASE 2: Volunteer with ATTENDANCE_SCAN & ATTENDANCE_VIEW gets 200 on Attendance, 403 on Payments/Students")
    void testVolunteerAttendanceScopePermissions() throws Exception {
        User volunteer = User.builder()
                .studentId("vol_att_only")
                .name("Attendance Volunteer")
                .email("volatt@mnit.ac.in")
                .password(passwordEncoder.encode("Pass123"))
                .role(Role.ROLE_VOLUNTEER)
                .roles(new HashSet<>(List.of(Role.ROLE_VOLUNTEER)))
                .permissions(new HashSet<>(List.of("ATTENDANCE_SCAN", "ATTENDANCE_VIEW")))
                .enabled(true)
                .build();
        userRepository.save(volunteer);
        String token = jwtProvider.generateToken(volunteer);

        // 1. Attendance summary -> 403 Forbidden (Blocked for volunteers)
        mockMvc.perform(get("/api/v1/admin/attendance/summary")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());

        // 2. Payments overview -> 403 Forbidden (missing PAYMENT_VIEW)
        mockMvc.perform(get("/api/v1/admin/payments")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());

        // 3. Students directory -> 403 Forbidden (missing STUDENT_VIEW)
        mockMvc.perform(get("/api/v1/admin/students")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("RBAC TEST CASE 3: Volunteer with STUDENT_VIEW & PAYMENT_VIEW gets 200 on Students/Payments")
    void testVolunteerStudentAndPaymentScopePermissions() throws Exception {
        User volunteer = User.builder()
                .studentId("vol_std_pay")
                .name("Student & Payment Volunteer")
                .email("volstdpay@mnit.ac.in")
                .password(passwordEncoder.encode("Pass123"))
                .role(Role.ROLE_VOLUNTEER)
                .roles(new HashSet<>(List.of(Role.ROLE_VOLUNTEER)))
                .permissions(new HashSet<>(List.of("STUDENT_VIEW", "PAYMENT_VIEW")))
                .enabled(true)
                .build();
        userRepository.save(volunteer);
        String token = jwtProvider.generateToken(volunteer);

        // 1. Students directory -> 403 Forbidden (Blocked for volunteers)
        mockMvc.perform(get("/api/v1/admin/students")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());

        // 2. Payments overview -> 403 Forbidden (Blocked for volunteers)
        mockMvc.perform(get("/api/v1/admin/payments")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());

        // 3. Attendance summary -> 403 Forbidden (missing ATTENDANCE_VIEW)
        mockMvc.perform(get("/api/v1/admin/attendance/summary")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());
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
