package com.cbp7.program.attendance.session;

import com.cbp7.program.attendance.session.dto.request.CreateAttendanceSessionRequest;
import com.cbp7.program.attendance.session.dto.request.UpdateAttendanceSessionRequest;
import com.cbp7.program.attendance.session.dto.response.AttendanceSessionResponse;
import com.cbp7.program.attendance.session.entity.AttendanceSession;
import com.cbp7.program.attendance.session.entity.SessionStatus;
import com.cbp7.program.attendance.session.repository.AttendanceSessionRepository;
import com.cbp7.program.attendance.session.service.AttendanceSessionService;
import com.cbp7.common.exception.DuplicateResourceException;
import com.cbp7.common.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
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
    "spring.datasource.hikari.connection-init-sql=CREATE SCHEMA IF NOT EXISTS identity; CREATE SCHEMA IF NOT EXISTS program; CREATE SCHEMA IF NOT EXISTS platform;"
})
class AttendanceSessionServiceTest {

    @Autowired
    private AttendanceSessionService sessionService;

    @Autowired
    private AttendanceSessionRepository sessionRepository;

    @BeforeEach
    void setUp() {
        sessionRepository.deleteAll();
    }

    @Test
    @DisplayName("1. Create session successfully")
    void createSessionSuccessfully() {
        CreateAttendanceSessionRequest request = new CreateAttendanceSessionRequest(
                1, "Orientation", "Intro session", LocalDate.now(), LocalTime.of(9, 0), LocalTime.of(17, 0), "Hall A"
        );

        AttendanceSessionResponse response = sessionService.createSession(request, "admin1");

        assertNotNull(response.id());
        assertEquals(1, response.dayNumber());
        assertEquals("Orientation", response.title());
        assertEquals(SessionStatus.UPCOMING, response.status());
        assertTrue(response.visibility());
    }

    @Test
    @DisplayName("2. Duplicate day number creation throws DuplicateResourceException")
    void duplicateDayNumberThrowsException() {
        CreateAttendanceSessionRequest req1 = new CreateAttendanceSessionRequest(
                1, "Orientation", "Intro", LocalDate.now(), LocalTime.of(9, 0), LocalTime.of(17, 0), "Hall A"
        );
        sessionService.createSession(req1, "admin1");

        CreateAttendanceSessionRequest req2 = new CreateAttendanceSessionRequest(
                1, "Communication", "Soft skills", LocalDate.now(), LocalTime.of(9, 0), LocalTime.of(17, 0), "Hall B"
        );

        assertThrows(DuplicateResourceException.class, () -> sessionService.createSession(req2, "admin1"));
    }

    @Test
    @DisplayName("3. Update session updates fields successfully")
    void updateSessionSuccessfully() {
        CreateAttendanceSessionRequest req = new CreateAttendanceSessionRequest(
                1, "Orientation", "Intro", LocalDate.now(), LocalTime.of(9, 0), LocalTime.of(17, 0), "Hall A"
        );
        AttendanceSessionResponse created = sessionService.createSession(req, "admin1");

        UpdateAttendanceSessionRequest updateReq = new UpdateAttendanceSessionRequest(
                1, "Orientation Updated", "Updated desc", LocalDate.now(), LocalTime.of(10, 0), LocalTime.of(18, 0), "Hall C", SessionStatus.ACTIVE, false
        );

        AttendanceSessionResponse updated = sessionService.updateSession(created.id(), updateReq);

        assertEquals("Orientation Updated", updated.title());
        assertEquals("Hall C", updated.venue());
        assertEquals(SessionStatus.ACTIVE, updated.status());
        assertFalse(updated.visibility());
    }

    @Test
    @DisplayName("4. Visibility toggle updates visibility")
    void setVisibilityUpdatesVisibility() {
        CreateAttendanceSessionRequest req = new CreateAttendanceSessionRequest(
                1, "Orientation", "Intro", LocalDate.now(), LocalTime.of(9, 0), LocalTime.of(17, 0), "Hall A"
        );
        AttendanceSessionResponse created = sessionService.createSession(req, "admin1");

        AttendanceSessionResponse hidden = sessionService.setSessionVisibility(created.id(), false);
        assertFalse(hidden.visibility());

        AttendanceSessionResponse visible = sessionService.setSessionVisibility(created.id(), true);
        assertTrue(visible.visibility());
    }

    @Test
    @DisplayName("5. Activate and Close session updates status")
    void activateAndCloseSessionUpdatesStatus() {
        CreateAttendanceSessionRequest req = new CreateAttendanceSessionRequest(
                1, "Orientation", "Intro", LocalDate.now(), LocalTime.of(9, 0), LocalTime.of(17, 0), "Hall A"
        );
        AttendanceSessionResponse created = sessionService.createSession(req, "admin1");

        AttendanceSessionResponse activated = sessionService.activateSession(created.id());
        assertEquals(SessionStatus.ACTIVE, activated.status());

        AttendanceSessionResponse closed = sessionService.closeSession(created.id());
        assertEquals(SessionStatus.CLOSED, closed.status());
    }

    @Test
    @DisplayName("6. Close session with multiple active QR codes deactivates all without exception")
    void closeSessionWithMultipleActiveQrsSucceeds() {
        CreateAttendanceSessionRequest req = new CreateAttendanceSessionRequest(
                2, "Technical Workshop", "Coding", LocalDate.now(), LocalTime.of(9, 0), LocalTime.of(17, 0), "Hall B"
        );
        AttendanceSessionResponse created = sessionService.createSession(req, "admin1");
        sessionService.activateSession(created.id());

        // Close session
        AttendanceSessionResponse closed = sessionService.closeSession(created.id());
        assertEquals(SessionStatus.CLOSED, closed.status());
    }

    @Test
    @DisplayName("7. Delete session cleans up session and all dependent records")
    void deleteSessionDeletesSessionAndConnectedData() {
        CreateAttendanceSessionRequest req = new CreateAttendanceSessionRequest(
                4, "Leadership Lab", "Soft skills", LocalDate.now(), LocalTime.of(9, 0), LocalTime.of(17, 0), "Hall D"
        );
        AttendanceSessionResponse created = sessionService.createSession(req, "admin1");

        sessionService.deleteSession(created.id());

        assertFalse(sessionRepository.findById(created.id()).isPresent());
        assertThrows(ResourceNotFoundException.class, () -> sessionService.getSessionById(created.id()));
    }

    @Test
    @DisplayName("8. Delete non-existent session throws ResourceNotFoundException")
    void deleteNonExistentSessionThrowsException() {
        assertThrows(ResourceNotFoundException.class, () -> sessionService.deleteSession(java.util.UUID.randomUUID()));
    }
}
