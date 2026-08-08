package com.cbp7.attendance.record;

import com.cbp7.attendance.qr.entity.AttendanceQrCode;
import com.cbp7.attendance.qr.repository.AttendanceQrRepository;
import com.cbp7.attendance.qr.service.AttendanceQrService;
import com.cbp7.attendance.record.dto.AdminAttendanceSummaryResponse;
import com.cbp7.attendance.record.dto.DailyAttendanceReportResponse;
import com.cbp7.attendance.record.dto.StudentAttendanceSummaryResponse;
import com.cbp7.attendance.record.repository.AttendanceRecordRepository;
import com.cbp7.attendance.record.service.AttendanceQueryService;
import com.cbp7.attendance.record.service.AttendanceService;
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

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
@Transactional
@TestPropertySource(properties = {
    "spring.datasource.hikari.initialization-fail-timeout=-1",
    "spring.flyway.enabled=false",
    "spring.datasource.hikari.connection-init-sql=CREATE SCHEMA IF NOT EXISTS cbp; CREATE SCHEMA IF NOT EXISTS profile; CREATE SCHEMA IF NOT EXISTS payment; CREATE SCHEMA IF NOT EXISTS notification; CREATE SCHEMA IF NOT EXISTS attendance;"
})
class AttendanceQueryServiceTest {

    @Autowired
    private AttendanceQueryService attendanceQueryService;

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
    @DisplayName("1. Attendance summary and percentage calculation")
    void summaryAndPercentageCalculation() {
        String studentId = "2024student201";
        AttendanceQrCode qrCode = attendanceQrService.generateQrForStudent(studentId);
        attendanceService.markAttendance(qrCode.getToken(), "2024volunteer001");

        StudentAttendanceSummaryResponse summary = attendanceQueryService.getStudentAttendanceSummary(studentId);

        assertNotNull(summary);
        assertEquals(studentId, summary.studentId());
        assertEquals(1, summary.totalClasses());
        assertEquals(1, summary.present());
        assertEquals(100.0, summary.percentage());
        assertEquals(1, summary.records().size());
    }

    @Test
    @DisplayName("2. Empty attendance handling returns empty records list")
    void emptyAttendanceHandling() {
        String studentId = "2024student202";

        StudentAttendanceSummaryResponse summary = attendanceQueryService.getStudentAttendanceSummary(studentId);

        assertNotNull(summary);
        assertEquals(studentId, summary.studentId());
        assertEquals(0, summary.present());
        assertEquals(0, summary.records().size());
    }

    @Test
    @DisplayName("3. Student isolation ensures student A only sees student A's records")
    void studentIsolation() {
        String studentA = "2024studentA";
        String studentB = "2024studentB";

        AttendanceQrCode qrA = attendanceQrService.generateQrForStudent(studentA);
        AttendanceQrCode qrB = attendanceQrService.generateQrForStudent(studentB);

        attendanceService.markAttendance(qrA.getToken(), "2024volunteer001");
        attendanceService.markAttendance(qrB.getToken(), "2024volunteer001");

        StudentAttendanceSummaryResponse summaryA = attendanceQueryService.getStudentAttendanceSummary(studentA);
        assertEquals(1, summaryA.records().size());
        assertEquals(studentA, summaryA.records().get(0).studentId());

        StudentAttendanceSummaryResponse summaryB = attendanceQueryService.getStudentAttendanceSummary(studentB);
        assertEquals(1, summaryB.records().size());
        assertEquals(studentB, summaryB.records().get(0).studentId());
    }

    @Test
    @DisplayName("4. Date filtering returns correct records for date")
    void dateFiltering() {
        String studentId = "2024student203";
        AttendanceQrCode qrCode = attendanceQrService.generateQrForStudent(studentId);
        attendanceService.markAttendance(qrCode.getToken(), "2024volunteer001");

        DailyAttendanceReportResponse todayReport = attendanceQueryService.getAttendanceByDate(LocalDate.now());
        assertEquals(1, todayReport.totalPresent());
        assertEquals(1, todayReport.records().size());

        DailyAttendanceReportResponse yesterdayReport = attendanceQueryService.getAttendanceByDate(LocalDate.now().minusDays(1));
        assertEquals(0, yesterdayReport.totalPresent());
        assertEquals(0, yesterdayReport.records().size());
    }

    @Test
    @DisplayName("5. Admin attendance summary calculation")
    void adminAttendanceSummaryCalculation() {
        String studentId = "2024student204";
        AttendanceQrCode qrCode = attendanceQrService.generateQrForStudent(studentId);
        attendanceService.markAttendance(qrCode.getToken(), "2024volunteer001");

        AdminAttendanceSummaryResponse adminSummary = attendanceQueryService.getAdminAttendanceSummary();

        assertNotNull(adminSummary);
        assertTrue(adminSummary.totalAttendanceToday() >= 1);
    }
}
