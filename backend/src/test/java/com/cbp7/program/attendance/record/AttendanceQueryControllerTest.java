package com.cbp7.program.attendance.record;

import com.cbp7.program.attendance.qr.dto.response.SessionQrCodeResponse;
import com.cbp7.program.attendance.qr.repository.AttendanceQrRepository;
import com.cbp7.program.attendance.qr.service.AttendanceQrService;
import com.cbp7.program.attendance.record.repository.AttendanceRecordRepository;
import com.cbp7.program.attendance.record.service.AttendanceService;
import com.cbp7.program.attendance.session.entity.AttendanceSession;
import com.cbp7.program.attendance.session.entity.SessionStatus;
import com.cbp7.program.attendance.session.repository.AttendanceSessionRepository;
import com.cbp7.identity.auth.entity.Role;
import com.cbp7.identity.auth.entity.User;
import com.cbp7.identity.auth.repository.UserRepository;
import com.cbp7.identity.auth.security.JwtProvider;
import com.cbp7.platform.notification.event.NotificationEventPublisher;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import java.time.LocalDate;
import java.time.LocalTime;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@Transactional
@TestPropertySource(properties = {
    "spring.datasource.hikari.initialization-fail-timeout=-1",
    "spring.flyway.enabled=false",
    "spring.datasource.hikari.connection-init-sql=CREATE SCHEMA IF NOT EXISTS identity; CREATE SCHEMA IF NOT EXISTS program; CREATE SCHEMA IF NOT EXISTS platform;"
})
class AttendanceQueryControllerTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AttendanceSessionRepository sessionRepository;

    @Autowired
    private AttendanceQrRepository attendanceQrRepository;

    @Autowired
    private AttendanceRecordRepository attendanceRecordRepository;

    @Autowired
    private AttendanceQrService attendanceQrService;

    @Autowired
    private AttendanceService attendanceService;

    @Autowired
    private JwtProvider jwtProvider;

    @MockitoBean
    private NotificationEventPublisher notificationEventPublisher;

    private String adminToken;
    private String studentToken;
    private String volunteerToken;

    private User studentUser;
    private AttendanceSession session;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        attendanceRecordRepository.deleteAll();
        attendanceQrRepository.deleteAll();
        sessionRepository.deleteAll();

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

        session = sessionRepository.save(AttendanceSession.builder()
                .dayNumber(1)
                .title("Day 1 Orientation")
                .sessionDate(LocalDate.now())
                .startTime(LocalTime.of(9, 0))
                .endTime(LocalTime.of(23, 59))
                .venue("APJ Hall")
                .status(SessionStatus.ACTIVE)
                .createdBy("2024admin001")
                .build());

        adminToken = jwtProvider.generateToken(adminUser);
        studentToken = jwtProvider.generateToken(studentUser);
        volunteerToken = jwtProvider.generateToken(volunteerUser);
    }

    @Test
    @DisplayName("1. Admin views student attendance history -> HTTP 200 OK")
    void adminViewsStudentAttendanceHistory() throws Exception {
        SessionQrCodeResponse qrCode = attendanceQrService.generateSessionQr(session.getId());
        attendanceService.markAttendanceViaQr(qrCode.token(), studentUser.getStudentId(), "2024volunteer001");

        mockMvc.perform(get("/api/v1/admin/attendance/student/{studentId}", studentUser.getStudentId())
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.studentId").value(studentUser.getStudentId()))
                .andExpect(jsonPath("$.data.attendedSessions").value(1));
    }

    @Test
    @DisplayName("2. Admin views overall attendance summary -> HTTP 200 OK")
    void adminViewsOverallSummary() throws Exception {
        mockMvc.perform(get("/api/v1/admin/attendance/summary")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalRegisteredStudents").exists());
    }

    @Test
    @DisplayName("3. Student views own attendance summary -> HTTP 200 OK")
    void studentViewsOwnAttendanceSummary() throws Exception {
        SessionQrCodeResponse qrCode = attendanceQrService.generateSessionQr(session.getId());
        attendanceService.markAttendanceViaQr(qrCode.token(), studentUser.getStudentId(), "2024volunteer001");

        mockMvc.perform(get("/api/v1/student/attendance")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.studentId").value(studentUser.getStudentId()))
                .andExpect(jsonPath("$.data.attendedSessions").value(1));
    }

    @Test
    @DisplayName("4. Student tries to access admin API -> HTTP 403 Forbidden")
    void studentTriesToAccessAdminApiReturns403() throws Exception {
        mockMvc.perform(get("/api/v1/admin/attendance/summary")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("5. Volunteer tries to access admin reports -> HTTP 403 Forbidden")
    void volunteerTriesToAccessAdminReportsReturns403() throws Exception {
        mockMvc.perform(get("/api/v1/admin/attendance/summary")
                        .header("Authorization", "Bearer " + volunteerToken))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("6. Unauthenticated request -> HTTP 401 Unauthorized")
    void unauthenticatedRequestReturns401() throws Exception {
        mockMvc.perform(get("/api/v1/student/attendance"))
                .andExpect(status().isUnauthorized());
    }
}
