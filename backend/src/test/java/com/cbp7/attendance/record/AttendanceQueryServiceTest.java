package com.cbp7.attendance.record;

import com.cbp7.attendance.qr.dto.SessionQrCodeResponse;
import com.cbp7.attendance.qr.repository.AttendanceQrRepository;
import com.cbp7.attendance.qr.service.AttendanceQrService;
import com.cbp7.attendance.record.dto.AdminAttendanceSummaryResponse;
import com.cbp7.attendance.record.dto.StudentAttendanceSummaryResponse;
import com.cbp7.attendance.record.repository.AttendanceRecordRepository;
import com.cbp7.attendance.record.service.AttendanceQueryService;
import com.cbp7.attendance.record.service.AttendanceService;
import com.cbp7.attendance.session.entity.AttendanceSession;
import com.cbp7.attendance.session.entity.SessionStatus;
import com.cbp7.attendance.session.repository.AttendanceSessionRepository;
import com.cbp7.notification.event.NotificationEventPublisher;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
@TestPropertySource(properties = {
    "spring.datasource.hikari.initialization-fail-timeout=-1",
    "spring.flyway.enabled=false",
    "spring.datasource.hikari.connection-init-sql=CREATE SCHEMA IF NOT EXISTS identity; CREATE SCHEMA IF NOT EXISTS program; CREATE SCHEMA IF NOT EXISTS platform;"
})
class AttendanceQueryServiceTest {

    @Autowired
    private AttendanceQueryService attendanceQueryService;

    @Autowired
    private AttendanceService attendanceService;

    @Autowired
    private AttendanceQrService attendanceQrService;

    @Autowired
    private AttendanceSessionRepository sessionRepository;

    @Autowired
    private AttendanceQrRepository attendanceQrRepository;

    @Autowired
    private AttendanceRecordRepository attendanceRecordRepository;

    @MockitoBean
    private NotificationEventPublisher notificationEventPublisher;

    private AttendanceSession session;

    @BeforeEach
    void setUp() {
        attendanceRecordRepository.deleteAll();
        attendanceQrRepository.deleteAll();
        sessionRepository.deleteAll();

        session = sessionRepository.save(AttendanceSession.builder()
                .dayNumber(1)
                .title("Day 1 Orientation")
                .sessionDate(LocalDate.now())
                .startTime(LocalTime.of(9, 0))
                .endTime(LocalTime.of(12, 0))
                .venue("APJ Hall")
                .status(SessionStatus.ACTIVE)
                .createdBy("admin001")
                .build());
    }

    @Test
    @DisplayName("1. Attendance summary and percentage calculation")
    void summaryAndPercentageCalculation() {
        String studentId = "2024student201";
        SessionQrCodeResponse qrCode = attendanceQrService.generateSessionQr(session.getId(), 120);
        attendanceService.markAttendanceViaQr(qrCode.token(), studentId, "2024volunteer001");

        StudentAttendanceSummaryResponse summary = attendanceQueryService.getStudentAttendanceSummary(studentId);

        assertNotNull(summary);
        assertEquals(studentId, summary.studentId());
        assertEquals(1, summary.totalSessions());
        assertEquals(1, summary.attendedSessions());
        assertEquals(100.0, summary.attendancePercentage());
        assertEquals(1, summary.sessions().size());
    }

    @Test
    @DisplayName("2. Empty attendance handling returns empty records list")
    void emptyAttendanceHandling() {
        String studentId = "2024student202";

        StudentAttendanceSummaryResponse summary = attendanceQueryService.getStudentAttendanceSummary(studentId);

        assertNotNull(summary);
        assertEquals(studentId, summary.studentId());
        assertEquals(0, summary.attendedSessions());
        assertEquals(1, summary.sessions().size()); // 1 session exists (ABSENT)
    }

    @Test
    @DisplayName("3. Admin attendance summary calculation")
    void adminAttendanceSummaryCalculation() {
        String studentId = "2024student204";
        SessionQrCodeResponse qrCode = attendanceQrService.generateSessionQr(session.getId(), 120);
        attendanceService.markAttendanceViaQr(qrCode.token(), studentId, "2024volunteer001");

        AdminAttendanceSummaryResponse adminSummary = attendanceQueryService.getAdminAttendanceSummary();

        assertNotNull(adminSummary);
        assertTrue(adminSummary.totalAttendanceToday() >= 1);
    }
}
