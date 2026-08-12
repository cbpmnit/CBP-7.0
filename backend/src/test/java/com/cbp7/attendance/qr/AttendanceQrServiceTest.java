package com.cbp7.attendance.qr;

import com.cbp7.attendance.qr.dto.response.SessionQrCodeResponse;
import com.cbp7.attendance.qr.entity.AttendanceQrCode;
import com.cbp7.attendance.qr.repository.AttendanceQrRepository;
import com.cbp7.attendance.qr.service.AttendanceQrService;
import com.cbp7.attendance.session.entity.AttendanceSession;
import com.cbp7.attendance.session.entity.SessionStatus;
import com.cbp7.attendance.session.repository.AttendanceSessionRepository;
import com.cbp7.common.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
@TestPropertySource(properties = {
    "spring.datasource.hikari.initialization-fail-timeout=-1",
    "spring.flyway.enabled=false",
    "spring.datasource.hikari.connection-init-sql=CREATE SCHEMA IF NOT EXISTS identity; CREATE SCHEMA IF NOT EXISTS program; CREATE SCHEMA IF NOT EXISTS platform;"
})
class AttendanceQrServiceTest {

    @Autowired
    private AttendanceQrService attendanceQrService;

    @Autowired
    private AttendanceQrRepository attendanceQrRepository;

    @Autowired
    private AttendanceSessionRepository sessionRepository;

    private AttendanceSession session;

    @BeforeEach
    void setUp() {
        attendanceQrRepository.deleteAll();
        sessionRepository.deleteAll();

        session = sessionRepository.save(AttendanceSession.builder()
                .dayNumber(1)
                .title("Day 1 Workshop")
                .sessionDate(LocalDate.now())
                .startTime(LocalTime.of(9, 0))
                .endTime(LocalTime.of(23, 59))
                .venue("Main Hall")
                .status(SessionStatus.ACTIVE)
                .createdBy("admin001")
                .build());
    }

    @Test
    @DisplayName("1. Session QR generation derives expiry strictly from session end time")
    void generateSessionQrCreatesValidToken() {
        SessionQrCodeResponse response = attendanceQrService.generateSessionQr(session.getId());

        assertNotNull(response);
        assertNotNull(response.token());
        assertTrue(response.token().startsWith("CBP_SESSION_QR_"));
        assertTrue(response.active());
        assertNotNull(response.expiresAt());
        assertEquals(LocalDateTime.of(session.getSessionDate(), session.getEndTime()), response.expiresAt());
        assertNotNull(response.qrImageBase64());
        assertTrue(response.qrImageBase64().startsWith("data:image/png;base64,"));
    }

    @Test
    @DisplayName("2. Active QR retrieval returns active session QR")
    void getActiveSessionQrReturnsActiveQr() {
        SessionQrCodeResponse generated = attendanceQrService.generateSessionQr(session.getId());

        SessionQrCodeResponse retrieved = attendanceQrService.getActiveSessionQr(session.getId());

        assertNotNull(retrieved);
        assertEquals(generated.token(), retrieved.token());
    }

    @Test
    @DisplayName("3. Validate QR token succeeds for active token")
    void validateQrTokenSucceeds() {
        SessionQrCodeResponse generated = attendanceQrService.generateSessionQr(session.getId());

        AttendanceQrCode validated = attendanceQrService.validateQrToken(generated.token());

        assertNotNull(validated);
        assertEquals(session.getId(), validated.getSessionId());
        assertTrue(validated.isActive());
    }

    @Test
    @DisplayName("4. Deactivate session QR marks active token inactive")
    void deactivateSessionQrMarksInactive() {
        attendanceQrService.generateSessionQr(session.getId());
        attendanceQrService.deactivateSessionQr(session.getId());

        assertThrows(ResourceNotFoundException.class, () -> attendanceQrService.getActiveSessionQr(session.getId()));
    }
}
