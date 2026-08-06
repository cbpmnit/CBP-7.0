package com.cbp7.attendance.record;

import com.cbp7.attendance.qr.entity.AttendanceQrCode;
import com.cbp7.attendance.qr.repository.AttendanceQrRepository;
import com.cbp7.attendance.qr.service.AttendanceQrService;
import com.cbp7.attendance.record.dto.MarkAttendanceRequest;
import com.cbp7.attendance.record.repository.AttendanceRecordRepository;
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

import static org.hamcrest.Matchers.hasSize;
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
class AttendanceControllerTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

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

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();

        attendanceRecordRepository.deleteAll();
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
    @DisplayName("1. Volunteer marks attendance successfully -> HTTP 200 OK")
    void volunteerMarksAttendanceSuccessfully() throws Exception {
        AttendanceQrCode qrCode = attendanceQrService.generateQrForStudent(studentUser.getStudentId());
        MarkAttendanceRequest request = new MarkAttendanceRequest(qrCode.getToken());

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
        MarkAttendanceRequest request = new MarkAttendanceRequest("CBP_ATTENDANCE_SOME_TOKEN");

        mockMvc.perform(post("/api/v1/attendance/mark")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }

    @Test
    @DisplayName("3. Admin access to attendance by date works -> HTTP 200 OK")
    void adminAccessToAttendanceByDateWorks() throws Exception {
        AttendanceQrCode qrCode = attendanceQrService.generateQrForStudent(studentUser.getStudentId());
        MarkAttendanceRequest request = new MarkAttendanceRequest(qrCode.getToken());

        mockMvc.perform(post("/api/v1/attendance/mark")
                        .header("Authorization", "Bearer " + volunteerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/admin/attendance/date/{date}", LocalDate.now().toString())
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(1)));
    }

    @Test
    @DisplayName("4. Student accesses own attendance history -> HTTP 200 OK")
    void studentAccessesOwnAttendanceHistory() throws Exception {
        AttendanceQrCode qrCode = attendanceQrService.generateQrForStudent(studentUser.getStudentId());
        MarkAttendanceRequest request = new MarkAttendanceRequest(qrCode.getToken());

        mockMvc.perform(post("/api/v1/attendance/mark")
                        .header("Authorization", "Bearer " + volunteerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/student/attendance")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data", hasSize(1)));
    }

    @Test
    @DisplayName("5. Unauthenticated request -> HTTP 401 Unauthorized")
    void unauthenticatedRequestReturns401() throws Exception {
        mockMvc.perform(post("/api/v1/attendance/mark"))
                .andExpect(status().isUnauthorized());
    }
}
