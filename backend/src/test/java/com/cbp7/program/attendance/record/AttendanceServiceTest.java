package com.cbp7.program.attendance.record;

import com.cbp7.program.attendance.qr.dto.response.SessionQrCodeResponse;
import com.cbp7.program.attendance.qr.repository.AttendanceQrRepository;
import com.cbp7.program.attendance.qr.service.AttendanceQrService;
import com.cbp7.program.attendance.record.dto.response.AttendanceRecordResponse;
import com.cbp7.program.attendance.record.entity.AttendanceStatus;
import com.cbp7.program.attendance.record.repository.AttendanceRecordRepository;
import com.cbp7.program.attendance.record.service.AttendanceService;
import com.cbp7.program.attendance.session.entity.AttendanceSession;
import com.cbp7.program.attendance.session.entity.SessionStatus;
import com.cbp7.program.attendance.session.repository.AttendanceSessionRepository;
import com.cbp7.common.exception.DuplicateResourceException;
import com.cbp7.common.exception.ResourceNotFoundException;
import com.cbp7.platform.notification.events.NotificationEventPublisher;
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
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
@TestPropertySource(properties = {
    "spring.datasource.hikari.initialization-fail-timeout=-1",
    "spring.flyway.enabled=false",
    "spring.datasource.hikari.connection-init-sql=CREATE SCHEMA IF NOT EXISTS identity; CREATE SCHEMA IF NOT EXISTS program; CREATE SCHEMA IF NOT EXISTS platform; CREATE SCHEMA IF NOT EXISTS registration;"
})
class AttendanceServiceTest {

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
                .endTime(LocalTime.of(23, 59))
                .venue("APJ Hall")
                .status(SessionStatus.ACTIVE)
                .createdBy("admin001")
                .build());
    }

    @Test
    @DisplayName("1. Valid Session QR creates attendance record successfully")
    void validQrCreatesAttendanceRecord() {
        String studentId = "2024student101";
        SessionQrCodeResponse qrCode = attendanceQrService.generateSessionQr(session.getId());

        AttendanceRecordResponse response = attendanceService.markAttendanceViaQr(qrCode.token(), studentId, "2024volunteer001");

        assertNotNull(response.id());
        assertEquals(studentId, response.studentId());
        assertEquals(session.getId(), response.sessionId());
        assertEquals("2024volunteer001", response.markedBy());
        assertEquals(AttendanceStatus.PRESENT, response.status());
    }

    @Test
    @DisplayName("2. Invalid QR token is rejected with ResourceNotFoundException")
    void invalidQrTokenThrowsException() {
        assertThrows(ResourceNotFoundException.class, () ->
                attendanceService.markAttendanceViaQr("CBP_SESSION_QR_INVALID_TOKEN", "2024student101", "2024volunteer001")
        );
    }

    @Test
    @DisplayName("3. Duplicate attendance in same session is rejected with DuplicateResourceException")
    void duplicateAttendanceRejected() {
        String studentId = "2024student103";
        SessionQrCodeResponse qrCode = attendanceQrService.generateSessionQr(session.getId());

        attendanceService.markAttendanceViaQr(qrCode.token(), studentId, "2024volunteer001");

        assertThrows(DuplicateResourceException.class, () ->
                attendanceService.markAttendanceViaQr(qrCode.token(), studentId, "2024volunteer001")
        );
    }

    @Test
    @DisplayName("4. Session and Student attendance history retrieval works")
    void attendanceHistoryRetrievalWorks() {
        String studentId = "2024student105";
        SessionQrCodeResponse qrCode = attendanceQrService.generateSessionQr(session.getId());
        attendanceService.markAttendanceViaQr(qrCode.token(), studentId, "2024volunteer001");

        List<AttendanceRecordResponse> sessionRecords = attendanceService.getSessionAttendanceRecords(session.getId());
        assertTrue(sessionRecords.stream().anyMatch(r -> r.studentId().equals(studentId)));

        List<AttendanceRecordResponse> studentHistory = attendanceService.getStudentAttendanceHistory(studentId);
        assertEquals(1, studentHistory.size());
        assertEquals(studentId, studentHistory.get(0).studentId());
    }

    @Test
    @DisplayName("5. Expired session QR token is rejected")
    void expiredQrTokenThrowsException() {
        String studentId = "2024student106";
        SessionQrCodeResponse qrCode = attendanceQrService.generateSessionQr(session.getId());

        // Set QR expiry to the past
        attendanceQrRepository.findByToken(qrCode.token()).ifPresent(qr -> {
            qr.setExpiresAt(java.time.LocalDateTime.now().minusHours(1));
            attendanceQrRepository.save(qr);
        });

        assertThrows(IllegalStateException.class, () ->
                attendanceService.markAttendanceViaQr(qrCode.token(), studentId, "2024volunteer001")
        );
    }

    @Test
    @DisplayName("6. Inactive or closed session rejects attendance marking")
    void closedSessionRejectsAttendance() {
        String studentId = "2024student107";
        SessionQrCodeResponse qrCode = attendanceQrService.generateSessionQr(session.getId());

        session.setStatus(SessionStatus.CLOSED);
        sessionRepository.save(session);

        assertThrows(IllegalStateException.class, () ->
                attendanceService.markAttendanceViaQr(qrCode.token(), studentId, "2024volunteer001")
        );
    }

    @Test
    @DisplayName("7. Multiple sessions for the same student are allowed")
    void multipleSessionsForSameStudentAllowed() {
        String studentId = "2024student108";

        // Mark Day 1
        SessionQrCodeResponse qr1 = attendanceQrService.generateSessionQr(session.getId());
        AttendanceRecordResponse rec1 = attendanceService.markAttendanceViaQr(qr1.token(), studentId, "2024volunteer001");
        assertNotNull(rec1.id());

        // Create Day 2 Session
        AttendanceSession session2 = sessionRepository.save(AttendanceSession.builder()
                .dayNumber(2)
                .title("Day 2 Workshop")
                .sessionDate(LocalDate.now())
                .startTime(LocalTime.of(0, 0))
                .endTime(LocalTime.of(23, 59))
                .venue("APJ Hall")
                .status(SessionStatus.ACTIVE)
                .createdBy("admin001")
                .build());

        // Mark Day 2
        SessionQrCodeResponse qr2 = attendanceQrService.generateSessionQr(session2.getId());
        AttendanceRecordResponse rec2 = attendanceService.markAttendanceViaQr(qr2.token(), studentId, "2024volunteer001");
        assertNotNull(rec2.id());

        List<AttendanceRecordResponse> studentHistory = attendanceService.getStudentAttendanceHistory(studentId);
        assertEquals(2, studentHistory.size());
    }
}
