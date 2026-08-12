package com.cbp7.program.attendance.session;

import com.cbp7.program.attendance.qr.repository.AttendanceQrRepository;
import com.cbp7.program.attendance.record.entity.AttendanceRecord;
import com.cbp7.program.attendance.record.entity.AttendanceStatus;
import com.cbp7.program.attendance.record.repository.AttendanceRecordRepository;
import com.cbp7.program.attendance.session.dto.request.CreateAttendanceSessionRequest;
import com.cbp7.program.attendance.session.dto.request.UpdateAttendanceSessionRequest;
import com.cbp7.program.attendance.session.entity.AttendanceSession;
import com.cbp7.program.attendance.session.entity.SessionStatus;
import com.cbp7.program.attendance.session.repository.AttendanceSessionRepository;
import com.cbp7.identity.auth.entity.Role;
import com.cbp7.identity.auth.entity.User;
import com.cbp7.identity.auth.repository.UserRepository;
import com.cbp7.identity.auth.security.JwtProvider;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.startsWith;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@Transactional
@TestPropertySource(properties = {
    "spring.datasource.hikari.initialization-fail-timeout=-1",
    "spring.flyway.enabled=false",
    "spring.datasource.hikari.connection-init-sql=CREATE SCHEMA IF NOT EXISTS identity; CREATE SCHEMA IF NOT EXISTS program; CREATE SCHEMA IF NOT EXISTS platform;"
})
class AdminAttendanceSessionControllerTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AttendanceSessionRepository sessionRepository;

    @Autowired
    private AttendanceQrRepository attendanceQrRepository;

    @Autowired
    private AttendanceRecordRepository attendanceRecordRepository;

    @Autowired
    private JwtProvider jwtProvider;

    private String adminToken;
    private String studentToken;
    private String volunteerToken;

    private AttendanceSession session;
    private User studentUser;

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
                .title("Day 1 Introduction to CBP")
                .description("Inauguration and overview")
                .sessionDate(LocalDate.now())
                .startTime(LocalTime.of(9, 30))
                .endTime(LocalTime.of(16, 30))
                .venue("APJ Hall")
                .status(SessionStatus.UPCOMING)
                .visibility(true)
                .createdBy("2024admin001")
                .build());

        adminToken = jwtProvider.generateToken(adminUser);
        studentToken = jwtProvider.generateToken(studentUser);
        volunteerToken = jwtProvider.generateToken(volunteerUser);
    }

    @Test
    @DisplayName("1. Admin creates session -> HTTP 201 Created")
    void adminCreatesSessionSuccessfully() throws Exception {
        CreateAttendanceSessionRequest request = new CreateAttendanceSessionRequest(
                2, "Communication Skills", "Session on soft skills",
                LocalDate.now().plusDays(1), LocalTime.of(10, 0), LocalTime.of(17, 0), "VLTC"
        );

        mockMvc.perform(post("/api/v1/admin/attendance/sessions")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.dayNumber").value(2))
                .andExpect(jsonPath("$.data.title").value("Communication Skills"))
                .andExpect(jsonPath("$.data.status").value("UPCOMING"));
    }

    @Test
    @DisplayName("2. Admin gets all sessions -> HTTP 200 OK")
    void adminGetsAllSessionsSuccessfully() throws Exception {
        mockMvc.perform(get("/api/v1/admin/attendance/sessions")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(1)))
                .andExpect(jsonPath("$.data[0].title").value("Day 1 Introduction to CBP"));
    }

    @Test
    @DisplayName("3. Admin gets session by ID -> HTTP 200 OK")
    void adminGetsSessionById() throws Exception {
        mockMvc.perform(get("/api/v1/admin/attendance/sessions/{id}", session.getId())
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(session.getId().toString()))
                .andExpect(jsonPath("$.data.dayNumber").value(1));
    }

    @Test
    @DisplayName("4. Admin updates session -> HTTP 200 OK")
    void adminUpdatesSession() throws Exception {
        UpdateAttendanceSessionRequest request = new UpdateAttendanceSessionRequest(
                1, "Day 1 Introduction Updated", "Updated desc",
                LocalDate.now(), LocalTime.of(9, 30), LocalTime.of(17, 0), "Main Auditorium",
                SessionStatus.ACTIVE, true
        );

        mockMvc.perform(put("/api/v1/admin/attendance/sessions/{id}", session.getId())
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.title").value("Day 1 Introduction Updated"))
                .andExpect(jsonPath("$.data.venue").value("Main Auditorium"))
                .andExpect(jsonPath("$.data.status").value("ACTIVE"));
    }

    @Test
    @DisplayName("5. Admin toggles session visibility -> HTTP 200 OK")
    void adminTogglesSessionVisibility() throws Exception {
        mockMvc.perform(patch("/api/v1/admin/attendance/sessions/{id}/visibility", session.getId())
                        .param("visibility", "false")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.visibility").value(false));
    }

    @Test
    @DisplayName("6. Admin activates and closes session -> HTTP 200 OK")
    void adminActivatesAndClosesSession() throws Exception {
        mockMvc.perform(post("/api/v1/admin/attendance/sessions/{id}/activate", session.getId())
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("ACTIVE"));

        mockMvc.perform(post("/api/v1/admin/attendance/sessions/{id}/close", session.getId())
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status").value("CLOSED"));
    }

    @Test
    @DisplayName("7. Admin generates and gets active session QR -> HTTP 201 / 200")
    void adminGeneratesAndGetsSessionQr() throws Exception {
        mockMvc.perform(post("/api/v1/admin/attendance/sessions/{id}/qr", session.getId())
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token", startsWith("CBP_SESSION_QR_")))
                .andExpect(jsonPath("$.data.qrImageBase64", startsWith("data:image/png;base64,")));

        mockMvc.perform(get("/api/v1/admin/attendance/sessions/{id}/qr", session.getId())
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.token", startsWith("CBP_SESSION_QR_")));
    }

    @Test
    @DisplayName("8. Admin gets session summary -> HTTP 200 OK")
    void adminGetsSessionSummary() throws Exception {
        attendanceRecordRepository.save(AttendanceRecord.builder()
                .sessionId(session.getId())
                .studentId(studentUser.getStudentId())
                .markedBy("2024admin001")
                .markedAt(LocalDateTime.now())
                .status(AttendanceStatus.PRESENT)
                .build());

        mockMvc.perform(get("/api/v1/admin/attendance/sessions/{id}/summary", session.getId())
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.sessionId").value(session.getId().toString()))
                .andExpect(jsonPath("$.data.dayNumber").value(1))
                .andExpect(jsonPath("$.data.presentCount").value(1))
                .andExpect(jsonPath("$.data.totalRegisteredStudents").exists());
    }

    @Test
    @DisplayName("9. Admin gets session records paginated with search and status -> HTTP 200 OK")
    void adminGetsSessionRecordsPaginated() throws Exception {
        attendanceRecordRepository.save(AttendanceRecord.builder()
                .sessionId(session.getId())
                .studentId(studentUser.getStudentId())
                .markedBy("2024admin001")
                .markedAt(LocalDateTime.now())
                .status(AttendanceStatus.PRESENT)
                .build());

        mockMvc.perform(get("/api/v1/admin/attendance/sessions/{id}/records", session.getId())
                        .param("search", "student")
                        .param("status", "PRESENT")
                        .param("page", "0")
                        .param("size", "10")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content", hasSize(1)))
                .andExpect(jsonPath("$.data.content[0].studentId").value(studentUser.getStudentId()));
    }

    @Test
    @DisplayName("10. Student tries admin session endpoint -> HTTP 403 Forbidden")
    void studentTriesAdminSessionEndpointReturns403() throws Exception {
        CreateAttendanceSessionRequest request = new CreateAttendanceSessionRequest(
                2, "Unauthorized Session", "desc",
                LocalDate.now(), LocalTime.of(10, 0), LocalTime.of(17, 0), "VLTC"
        );

        mockMvc.perform(post("/api/v1/admin/attendance/sessions")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }
}
