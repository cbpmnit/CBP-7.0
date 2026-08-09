package com.cbp7.certificate;

import com.cbp7.attendance.record.dto.StudentAttendanceSummaryResponse;
import com.cbp7.attendance.record.service.AttendanceQueryService;
import com.cbp7.auth.entity.Role;
import com.cbp7.auth.entity.User;
import com.cbp7.auth.repository.UserRepository;
import com.cbp7.auth.security.JwtProvider;
import com.cbp7.cbp.entity.CbpRegistration;
import com.cbp7.cbp.enums.RegistrationStatus;
import com.cbp7.cbp.repository.CbpRegistrationRepository;
import com.cbp7.certificate.repository.CertificateRepository;
import com.cbp7.certificate.service.CertificateService;
import com.cbp7.notification.event.NotificationEventPublisher;
import com.cbp7.profile.entity.Branch;
import com.cbp7.profile.entity.Course;
import com.cbp7.profile.entity.Gender;
import com.cbp7.profile.entity.UserProfile;
import com.cbp7.profile.repository.UserProfileRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import java.util.ArrayList;

import static org.hamcrest.Matchers.startsWith;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@Transactional
@TestPropertySource(properties = {
    "spring.datasource.hikari.initialization-fail-timeout=-1",
    "spring.flyway.enabled=false",
    "spring.datasource.hikari.connection-init-sql=CREATE SCHEMA IF NOT EXISTS identity; CREATE SCHEMA IF NOT EXISTS program; CREATE SCHEMA IF NOT EXISTS platform;"
})
class CertificateControllerTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserProfileRepository userProfileRepository;

    @Autowired
    private CbpRegistrationRepository cbpRegistrationRepository;

    @Autowired
    private CertificateRepository certificateRepository;

    @Autowired
    private CertificateService certificateService;

    @Autowired
    private JwtProvider jwtProvider;

    @MockitoBean
    private AttendanceQueryService attendanceQueryService;

    @MockitoBean
    private NotificationEventPublisher notificationEventPublisher;

    private String adminToken;
    private String studentToken;
    private String volunteerToken;

    private User studentUser;
    private UserProfile userProfile;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        certificateRepository.deleteAll();

        User adminUser = userRepository.findByStudentId("2024admin001")
                .orElseGet(() -> userRepository.save(User.builder()
                        .studentId("2024admin001")
                        .email("admin@mnit.ac.in")
                        .name("Admin User")
                        .password("password123")
                        .role(Role.ROLE_ADMIN)
                        .enabled(true)
                        .build()));

        studentUser = userRepository.findByStudentId("2024certstudent01")
                .orElseGet(() -> userRepository.save(User.builder()
                        .studentId("2024certstudent01")
                        .email("certstudent@mnit.ac.in")
                        .name("Cert Student")
                        .password("password123")
                        .role(Role.ROLE_STUDENT)
                        .enabled(true)
                        .build()));

        User volunteerUser = userRepository.findByStudentId("2024volunteer001")
                .orElseGet(() -> userRepository.save(User.builder()
                        .studentId("2024volunteer001")
                        .email("volunteer@mnit.ac.in")
                        .name("Volunteer User")
                        .password("password123")
                        .role(Role.ROLE_VOLUNTEER)
                        .enabled(true)
                        .build()));

        userProfile = userProfileRepository.save(UserProfile.builder()
                .user(studentUser)
                .firstName("Cert")
                .lastName("Student")
                .gender(Gender.MALE)
                .phoneNumber("9999999999")
                .sameAsWhatsapp(true)
                .course(Course.BTECH)
                .branch(Branch.COMPUTER_SCIENCE_ENGINEERING)
                .year(4)
                .hosteller(true)
                .build());

        cbpRegistrationRepository.findByUserStudentIdIgnoreCase("2024certstudent01")
                .orElseGet(() -> cbpRegistrationRepository.save(CbpRegistration.builder()
                        .user(studentUser)
                        .profile(userProfile)
                        .registrationId("REG-CERT-002")
                        .registrationStatus(RegistrationStatus.REGISTERED)
                        .studentId("2024certstudent01")
                        .firstName("Cert")
                        .lastName("Student")
                        .email("certstudent@mnit.ac.in")
                        .phoneNumber("9999999999")
                        .institute("MNIT")
                        .course("B.Tech")
                        .branch("CSE")
                        .year(4)
                        .hosteller(true)
                        .build()));

        adminToken = jwtProvider.generateToken(adminUser);
        studentToken = jwtProvider.generateToken(studentUser);
        volunteerToken = jwtProvider.generateToken(volunteerUser);

        when(attendanceQueryService.getStudentAttendanceSummary("2024certstudent01"))
                .thenReturn(new StudentAttendanceSummaryResponse("2024certstudent01", 10, 9, 90.0, new ArrayList<>()));
    }

    @Test
    @DisplayName("1. Admin generates certificate -> HTTP 200 OK")
    void adminGeneratesCertificateSuccessfully() throws Exception {
        mockMvc.perform(post("/api/v1/admin/certificates/generate/{studentId}", "2024certstudent01")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.certificateNumber", startsWith("CBP-2026-")))
                .andExpect(jsonPath("$.data.status").value("GENERATED"));
    }

    @Test
    @DisplayName("2. Student downloads certificate -> HTTP 200 OK application/pdf")
    void studentDownloadsCertificateSuccessfully() throws Exception {
        certificateService.generateCertificateForStudent("2024certstudent01");
        certificateService.publishAllCertificates();

        mockMvc.perform(get("/api/v1/student/certificate/download")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", MediaType.APPLICATION_PDF_VALUE))
                .andExpect(header().string("Content-Disposition", startsWith("attachment; filename=")));
    }

    @Test
    @DisplayName("3. Student cannot generate certificate -> HTTP 403 Forbidden")
    void studentCannotGenerateCertificateReturns403() throws Exception {
        mockMvc.perform(post("/api/v1/admin/certificates/generate/{studentId}", "2024certstudent01")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("4. Volunteer cannot access certificate endpoints -> HTTP 403 Forbidden")
    void volunteerCannotAccessCertificateEndpointsReturns403() throws Exception {
        mockMvc.perform(post("/api/v1/admin/certificates/generate/{studentId}", "2024certstudent01")
                        .header("Authorization", "Bearer " + volunteerToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("5. Unauthenticated request -> HTTP 401 Unauthorized")
    void unauthenticatedRequestReturns401() throws Exception {
        mockMvc.perform(get("/api/v1/student/certificate"))
                .andExpect(status().isUnauthorized());
    }
}
