package com.cbp7.attendance.record;

import com.cbp7.attendance.qr.dto.SessionQrCodeResponse;
import com.cbp7.attendance.qr.repository.AttendanceQrRepository;
import com.cbp7.attendance.qr.service.AttendanceQrService;
import com.cbp7.attendance.record.dto.MarkAttendanceRequest;
import com.cbp7.attendance.record.repository.AttendanceRecordRepository;
import com.cbp7.attendance.session.entity.AttendanceSession;
import com.cbp7.attendance.session.entity.SessionStatus;
import com.cbp7.attendance.session.repository.AttendanceSessionRepository;
import com.cbp7.auth.entity.Role;
import com.cbp7.auth.entity.User;
import com.cbp7.auth.repository.UserRepository;
import com.cbp7.auth.security.JwtProvider;
import com.cbp7.notification.event.NotificationEventPublisher;
import com.fasterxml.jackson.databind.ObjectMapper;
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

import java.time.LocalDate;
import java.time.LocalTime;

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
    "spring.datasource.hikari.connection-init-sql=CREATE SCHEMA IF NOT EXISTS identity; CREATE SCHEMA IF NOT EXISTS program; CREATE SCHEMA IF NOT EXISTS platform;"
})
class AttendanceControllerTest {

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
    private AttendanceQrService attendanceQrService;

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
                        .permissions(new java.util.HashSet<>(java.util.List.of("ATTENDANCE_SCAN")))
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
    @DisplayName("1. Volunteer marks attendance successfully via session QR -> HTTP 200 OK")
    void volunteerMarksAttendanceSuccessfully() throws Exception {
        SessionQrCodeResponse qrCode = attendanceQrService.generateSessionQr(session.getId());
        MarkAttendanceRequest request = new MarkAttendanceRequest(qrCode.token(), null, studentUser.getStudentId());

        mockMvc.perform(post("/api/v1/attendance/mark")
                        .header("Authorization", "Bearer " + volunteerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.studentId").value(studentUser.getStudentId()))
                .andExpect(jsonPath("$.data.status").value("PRESENT"));
    }

    @Test
    @DisplayName("2. Student tries marking attendance -> HTTP 403 Forbidden")
    void studentTriesMarkingAttendanceReturns403() throws Exception {
        MarkAttendanceRequest request = new MarkAttendanceRequest(null, session.getId(), studentUser.getStudentId());

        mockMvc.perform(post("/api/v1/attendance/mark")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("3. Student accesses own attendance summary -> HTTP 200 OK")
    void studentAccessesOwnAttendanceSummary() throws Exception {
        SessionQrCodeResponse qrCode = attendanceQrService.generateSessionQr(session.getId());
        MarkAttendanceRequest request = new MarkAttendanceRequest(qrCode.token(), null, studentUser.getStudentId());

        mockMvc.perform(post("/api/v1/attendance/mark")
                        .header("Authorization", "Bearer " + volunteerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/student/attendance")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.studentId").value(studentUser.getStudentId()))
                .andExpect(jsonPath("$.data.attendedSessions").value(1));
    }

    @Test
    @DisplayName("4. Unauthenticated request -> HTTP 401 Unauthorized")
    void unauthenticatedRequestReturns401() throws Exception {
        mockMvc.perform(post("/api/v1/attendance/mark"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("5. Expired session QR rejected -> HTTP 400 Bad Request")
    void expiredQrTokenRejectedReturns400() throws Exception {
        SessionQrCodeResponse qrCode = attendanceQrService.generateSessionQr(session.getId());

        attendanceQrRepository.findByToken(qrCode.token()).ifPresent(qr -> {
            qr.setExpiresAt(java.time.LocalDateTime.now().minusHours(1));
            attendanceQrRepository.save(qr);
        });

        MarkAttendanceRequest request = new MarkAttendanceRequest(qrCode.token(), null, studentUser.getStudentId());

        mockMvc.perform(post("/api/v1/attendance/mark")
                        .header("Authorization", "Bearer " + volunteerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("6. Closed session scan rejected -> HTTP 400 Bad Request")
    void closedSessionScanRejectedReturns400() throws Exception {
        SessionQrCodeResponse qrCode = attendanceQrService.generateSessionQr(session.getId());

        session.setStatus(SessionStatus.CLOSED);
        sessionRepository.save(session);

        MarkAttendanceRequest request = new MarkAttendanceRequest(qrCode.token(), null, studentUser.getStudentId());

        mockMvc.perform(post("/api/v1/attendance/mark")
                        .header("Authorization", "Bearer " + volunteerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("7. Duplicate scan rejected -> HTTP 409 Conflict")
    void duplicateScanRejectedReturns409() throws Exception {
        SessionQrCodeResponse qrCode = attendanceQrService.generateSessionQr(session.getId());
        MarkAttendanceRequest request = new MarkAttendanceRequest(qrCode.token(), null, studentUser.getStudentId());

        // First scan succeeds
        mockMvc.perform(post("/api/v1/attendance/mark")
                        .header("Authorization", "Bearer " + volunteerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        // Duplicate scan fails with 409
        mockMvc.perform(post("/api/v1/attendance/mark")
                        .header("Authorization", "Bearer " + volunteerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("8. Multiple sessions attendance for same student allowed")
    void multipleSessionsAttendanceAllowed() throws Exception {
        // Mark Day 1
        SessionQrCodeResponse qr1 = attendanceQrService.generateSessionQr(session.getId());
        MarkAttendanceRequest req1 = new MarkAttendanceRequest(qr1.token(), null, studentUser.getStudentId());

        mockMvc.perform(post("/api/v1/attendance/mark")
                        .header("Authorization", "Bearer " + volunteerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req1)))
                .andExpect(status().isOk());

        // Create Day 2 Session
        AttendanceSession session2 = sessionRepository.save(AttendanceSession.builder()
                .dayNumber(2)
                .title("Day 2 Soft Skills")
                .sessionDate(LocalDate.now())
                .startTime(LocalTime.of(0, 0))
                .endTime(LocalTime.of(23, 59))
                .venue("APJ Hall")
                .status(SessionStatus.ACTIVE)
                .createdBy("2024admin001")
                .build());

        // Mark Day 2
        SessionQrCodeResponse qr2 = attendanceQrService.generateSessionQr(session2.getId());
        MarkAttendanceRequest req2 = new MarkAttendanceRequest(qr2.token(), null, studentUser.getStudentId());

        mockMvc.perform(post("/api/v1/attendance/mark")
                        .header("Authorization", "Bearer " + volunteerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req2)))
                .andExpect(status().isOk());

        // Check student summary has 2 attended sessions
        mockMvc.perform(get("/api/v1/student/attendance")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.attendedSessions").value(2))
                .andExpect(jsonPath("$.data.totalSessions").value(2))
                .andExpect(jsonPath("$.data.attendancePercentage").value(100.0));
    }
}
