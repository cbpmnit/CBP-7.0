package com.cbp7.attendance.record.service;

import com.cbp7.attendance.qr.entity.AttendanceQrCode;
import com.cbp7.attendance.qr.service.AttendanceQrService;
import com.cbp7.attendance.record.dto.AttendanceRecordResponse;
import com.cbp7.attendance.record.entity.AttendanceRecord;
import com.cbp7.attendance.record.entity.AttendanceStatus;
import com.cbp7.attendance.record.event.AttendanceMarkedEvent;
import com.cbp7.attendance.record.repository.AttendanceRecordRepository;
import com.cbp7.attendance.session.entity.AttendanceSession;
import com.cbp7.attendance.session.entity.SessionStatus;
import com.cbp7.attendance.session.repository.AttendanceSessionRepository;
import com.cbp7.auth.entity.User;
import com.cbp7.auth.repository.UserRepository;
import com.cbp7.common.exception.DuplicateResourceException;
import com.cbp7.common.exception.ResourceNotFoundException;
import com.cbp7.notification.event.NotificationEventPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AttendanceService {

    private final AttendanceRecordRepository attendanceRecordRepository;
    private final AttendanceSessionRepository sessionRepository;
    private final AttendanceQrService attendanceQrService;
    private final NotificationEventPublisher notificationEventPublisher;
    private final UserRepository userRepository;

    @Transactional
    public AttendanceRecordResponse markAttendanceViaQr(String qrToken, String studentId, String volunteerId) {
        if (qrToken == null || qrToken.isBlank()) {
            throw new IllegalArgumentException("QR token must not be empty");
        }
        if (studentId == null || studentId.isBlank()) {
            throw new IllegalArgumentException("Student ID must not be empty");
        }
        if (volunteerId == null || volunteerId.isBlank()) {
            throw new IllegalArgumentException("Volunteer ID must not be empty");
        }

        // 1 & 2. Validate QR token exists, is active, and is not past expiresAt
        AttendanceQrCode qrCode = attendanceQrService.validateQrToken(qrToken);

        // 3. Validate session exists and status is ACTIVE
        AttendanceSession session = sessionRepository.findById(qrCode.getSessionId())
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with ID: " + qrCode.getSessionId()));

        if (session.getStatus() != SessionStatus.ACTIVE) {
            throw new IllegalStateException("Attendance session is not ACTIVE. Current status: " + session.getStatus());
        }

        // 4. Validate current time within session duration
        LocalDateTime now = LocalDateTime.now();
        if (session.getStartTime() != null) {
            LocalDateTime startDateTime = LocalDateTime.of(session.getSessionDate(), session.getStartTime());
            if (now.isBefore(startDateTime)) {
                throw new IllegalStateException("Attendance session has not started yet.");
            }
        }
        if (qrCode.getExpiresAt() != null && now.isAfter(qrCode.getExpiresAt())) {
            throw new IllegalStateException("Attendance session duration has ended and QR code has expired.");
        }

        // 5. Validate student not already marked for this sessionId
        String cleanStudentId = studentId.trim().toLowerCase();
        if (attendanceRecordRepository.existsBySessionIdAndStudentId(session.getId(), cleanStudentId)) {
            throw new DuplicateResourceException("Attendance already marked for student " + cleanStudentId + " in session Day " + session.getDayNumber());
        }

        AttendanceRecord record = AttendanceRecord.builder()
                .sessionId(session.getId())
                .studentId(cleanStudentId)
                .markedBy(volunteerId)
                .markedAt(now)
                .status(AttendanceStatus.PRESENT)
                .build();

        AttendanceRecord saved = attendanceRecordRepository.save(record);
        log.info("Attendance marked for student {} in session Day {} by {}", cleanStudentId, session.getDayNumber(), volunteerId);

        publishAttendanceMarkedEvent(saved);

        return AttendanceRecordResponse.fromEntity(saved);
    }

    @Transactional
    public AttendanceRecordResponse recordStudentAttendance(UUID sessionId, String studentId, String markedBy) {
        String cleanStudentId = studentId.trim().toLowerCase();

        AttendanceSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with ID: " + sessionId));

        if (attendanceRecordRepository.existsBySessionIdAndStudentId(sessionId, cleanStudentId)) {
            throw new DuplicateResourceException("Attendance already marked for student " + cleanStudentId + " in session Day " + session.getDayNumber());
        }

        AttendanceRecord record = AttendanceRecord.builder()
                .sessionId(sessionId)
                .studentId(cleanStudentId)
                .markedBy(markedBy)
                .markedAt(LocalDateTime.now())
                .status(AttendanceStatus.PRESENT)
                .build();

        AttendanceRecord saved = attendanceRecordRepository.save(record);
        log.info("Direct attendance marked for student {} in session Day {} by {}", cleanStudentId, session.getDayNumber(), markedBy);

        publishAttendanceMarkedEvent(saved);

        return AttendanceRecordResponse.fromEntity(saved);
    }

    private void publishAttendanceMarkedEvent(AttendanceRecord record) {
        try {
            String name = "";
            String email = "";
            Optional<User> userOpt = userRepository.findByStudentId(record.getStudentId());
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                name = user.getName() != null ? user.getName() : "";
                email = user.getEmail() != null ? user.getEmail() : "";
            }

            AttendanceMarkedEvent event = new AttendanceMarkedEvent(
                    record.getStudentId(),
                    name,
                    email,
                    record.getMarkedBy(),
                    record.getMarkedAt().toLocalDate(),
                    record.getMarkedAt(),
                    record.getStatus()
            );

            notificationEventPublisher.publish(event);
        } catch (Exception e) {
            log.error("Failed to publish AttendanceMarkedEvent for student: {}", record.getStudentId(), e);
        }
    }

    @Transactional(readOnly = true)
    public List<AttendanceRecordResponse> getSessionAttendanceRecords(UUID sessionId) {
        return attendanceRecordRepository.findBySessionId(sessionId).stream()
                .map(AttendanceRecordResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AttendanceRecordResponse> getStudentAttendanceHistory(String studentId) {
        if (studentId == null || studentId.isBlank()) {
            throw new IllegalArgumentException("Student ID must not be empty");
        }
        return attendanceRecordRepository.findByStudentId(studentId.trim().toLowerCase())
                .stream()
                .map(AttendanceRecordResponse::fromEntity)
                .toList();
    }
}
