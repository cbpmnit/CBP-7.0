package com.cbp7.attendance.record;

import com.cbp7.attendance.qr.entity.AttendanceQrCode;
import com.cbp7.attendance.qr.repository.AttendanceQrRepository;
import com.cbp7.attendance.qr.service.AttendanceQrService;
import com.cbp7.attendance.record.dto.AttendanceRecordResponse;
import com.cbp7.attendance.record.entity.AttendanceStatus;
import com.cbp7.attendance.record.repository.AttendanceRecordRepository;
import com.cbp7.attendance.record.service.AttendanceService;
import com.cbp7.common.exception.DuplicateResourceException;
import com.cbp7.common.exception.ResourceNotFoundException;
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
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@Transactional
@TestPropertySource(properties = {
    "spring.datasource.hikari.initialization-fail-timeout=-1",
    "spring.flyway.enabled=false",
    "spring.datasource.hikari.connection-init-sql=CREATE SCHEMA IF NOT EXISTS cbp; CREATE SCHEMA IF NOT EXISTS profile; CREATE SCHEMA IF NOT EXISTS payment; CREATE SCHEMA IF NOT EXISTS notification; CREATE SCHEMA IF NOT EXISTS attendance;"
})
class AttendanceServiceTest {

    @Autowired
    private AttendanceService attendanceService;

    @Autowired
    private AttendanceQrService attendanceQrService;

    @Autowired
    private AttendanceQrRepository attendanceQrRepository;

    @Autowired
    private AttendanceRecordRepository attendanceRecordRepository;

    @MockitoBean
    private NotificationEventPublisher notificationEventPublisher;

    @BeforeEach
    void setUp() {
        attendanceRecordRepository.deleteAll();
        attendanceQrRepository.deleteAll();
    }

    @Test
    @DisplayName("1. Valid QR creates attendance record successfully")
    void validQrCreatesAttendanceRecord() {
        String studentId = "2024student101";
        AttendanceQrCode qrCode = attendanceQrService.generateQrForStudent(studentId);

        AttendanceRecordResponse response = attendanceService.markAttendance(qrCode.getToken(), "2024volunteer001");

        assertNotNull(response.id());
        assertEquals(studentId, response.studentId());
        assertEquals(qrCode.getId(), response.qrCodeId());
        assertEquals("2024volunteer001", response.markedBy());
        assertEquals(LocalDate.now(), response.attendanceDate());
        assertEquals(AttendanceStatus.PRESENT, response.status());
    }

    @Test
    @DisplayName("2. Invalid QR token is rejected with ResourceNotFoundException")
    void invalidQrTokenThrowsException() {
        assertThrows(ResourceNotFoundException.class, () ->
                attendanceService.markAttendance("CBP_ATTENDANCE_INVALID_TOKEN", "2024volunteer001")
        );
    }

    @Test
    @DisplayName("3. Inactive QR code is rejected with IllegalStateException")
    void inactiveQrTokenThrowsException() {
        String studentId = "2024student102";
        AttendanceQrCode qrCode = attendanceQrService.generateQrForStudent(studentId);
        qrCode.setActive(false);
        attendanceQrRepository.save(qrCode);

        assertThrows(IllegalStateException.class, () ->
                attendanceService.markAttendance(qrCode.getToken(), "2024volunteer001")
        );
    }

    @Test
    @DisplayName("4. Duplicate attendance on same date is rejected with DuplicateResourceException")
    void duplicateAttendanceRejected() {
        String studentId = "2024student103";
        AttendanceQrCode qrCode = attendanceQrService.generateQrForStudent(studentId);

        attendanceService.markAttendance(qrCode.getToken(), "2024volunteer001");

        assertThrows(DuplicateResourceException.class, () ->
                attendanceService.markAttendance(qrCode.getToken(), "2024volunteer001")
        );
    }

    @Test
    @DisplayName("5. Correct volunteer ID is stored as markedBy")
    void correctVolunteerStoredAsMarkedBy() {
        String studentId = "2024student104";
        String volunteerId = "VOLUNTEER_PARV_99";
        AttendanceQrCode qrCode = attendanceQrService.generateQrForStudent(studentId);

        AttendanceRecordResponse response = attendanceService.markAttendance(qrCode.getToken(), volunteerId);

        assertEquals(volunteerId, response.markedBy());
    }

    @Test
    @DisplayName("6. Admin and Student attendance history retrieval works")
    void attendanceHistoryRetrievalWorks() {
        String studentId = "2024student105";
        AttendanceQrCode qrCode = attendanceQrService.generateQrForStudent(studentId);
        attendanceService.markAttendance(qrCode.getToken(), "2024volunteer001");

        List<AttendanceRecordResponse> dateRecords = attendanceService.getAttendanceForDate(LocalDate.now());
        assertTrue(dateRecords.stream().anyMatch(r -> r.studentId().equals(studentId)));

        List<AttendanceRecordResponse> studentHistory = attendanceService.getStudentAttendanceHistory(studentId);
        assertEquals(1, studentHistory.size());
        assertEquals(studentId, studentHistory.get(0).studentId());
    }
}
