package com.cbp7.attendance.qr;

import com.cbp7.attendance.qr.repository.AttendanceQrRepository;
import com.cbp7.attendance.qr.service.AttendanceQrService;
import com.cbp7.auth.entity.Role;
import com.cbp7.auth.entity.User;
import com.cbp7.auth.repository.UserRepository;
import com.cbp7.auth.security.JwtProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import static org.hamcrest.Matchers.startsWith;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@Transactional
@TestPropertySource(properties = {
    "spring.datasource.hikari.initialization-fail-timeout=-1",
    "spring.flyway.enabled=false",
    "spring.datasource.hikari.connection-init-sql=CREATE SCHEMA IF NOT EXISTS cbp; CREATE SCHEMA IF NOT EXISTS profile; CREATE SCHEMA IF NOT EXISTS payment; CREATE SCHEMA IF NOT EXISTS notification; CREATE SCHEMA IF NOT EXISTS attendance;"
})
class AttendanceQrControllerTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AttendanceQrRepository attendanceQrRepository;

    @Autowired
    private AttendanceQrService attendanceQrService;

    @Autowired
    private JwtProvider jwtProvider;

    private String adminToken;
    private String studentToken;
    private String volunteerToken;

    private User studentUser;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        attendanceQrRepository.deleteAll();

        User adminUser = userRepository.findByStudentId("2024admin001")
                .orElseGet(() -> userRepository.save(User.builder()
                        .studentId("2024admin001")
                        .email("admin@mnit.ac.in")
                        .name("Admin User")
                        .password("password123")
                        .role(Role.ROLE_ADMIN)
                        .enabled(true)
                        .build()));

        studentUser = userRepository.findByStudentId("2024student001")
                .orElseGet(() -> userRepository.save(User.builder()
                        .studentId("2024student001")
                        .email("student@mnit.ac.in")
                        .name("Student User")
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

        adminToken = jwtProvider.generateToken(adminUser);
        studentToken = jwtProvider.generateToken(studentUser);
        volunteerToken = jwtProvider.generateToken(volunteerUser);
    }

    @Test
    @DisplayName("1. Student gets QR successfully -> 200 OK")
    void studentGetsQrSuccessfully() throws Exception {
        attendanceQrService.generateQrForStudent(studentUser.getStudentId());

        mockMvc.perform(get("/api/v1/student/attendance/qr")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token", startsWith("CBP_ATTENDANCE_")))
                .andExpect(jsonPath("$.data.qrImage", startsWith("data:image/png;base64,")));
    }

    @Test
    @DisplayName("2. Student without QR -> 404 Not Found")
    void studentWithoutQrReturns404() throws Exception {
        mockMvc.perform(get("/api/v1/student/attendance/qr")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("3. Admin generates QR -> 201 Created")
    void adminGeneratesQrSuccessfully() throws Exception {
        mockMvc.perform(post("/api/v1/admin/attendance/qr/generate/{studentId}", "2024student001")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token", startsWith("CBP_ATTENDANCE_")))
                .andExpect(jsonPath("$.data.qrImage", startsWith("data:image/png;base64,")));
    }

    @Test
    @DisplayName("4. Volunteer accesses admin API -> 403 Forbidden")
    void volunteerAccessesAdminApiReturns403() throws Exception {
        mockMvc.perform(post("/api/v1/admin/attendance/qr/generate/{studentId}", "2024student001")
                        .header("Authorization", "Bearer " + volunteerToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("5. Unauthenticated access -> 401 Unauthorized")
    void unauthenticatedAccessReturns401() throws Exception {
        mockMvc.perform(get("/api/v1/student/attendance/qr"))
                .andExpect(status().isUnauthorized());
    }
}
