package com.cbp7.attendance.record.service.impl;

import com.cbp7.attendance.qr.entity.AttendanceQrCode;
import com.cbp7.attendance.qr.service.AttendanceQrService;
import com.cbp7.attendance.record.dto.response.AttendanceRecordResponse;
import com.cbp7.attendance.record.dto.response.ScanAttendanceResponse;
import com.cbp7.attendance.record.entity.AttendanceRecord;
import com.cbp7.attendance.record.entity.AttendanceStatus;
import com.cbp7.attendance.record.event.AttendanceMarkedEvent;
import com.cbp7.attendance.record.repository.AttendanceRecordRepository;
import com.cbp7.attendance.record.service.AttendanceService;
import com.cbp7.attendance.session.entity.AttendanceSession;
import com.cbp7.attendance.session.entity.SessionStatus;
import com.cbp7.attendance.session.repository.AttendanceSessionRepository;
import com.cbp7.auth.entity.User;
import com.cbp7.auth.repository.UserRepository;
import com.cbp7.cbp.entity.CbpRegistration;
import com.cbp7.cbp.repository.CbpRegistrationRepository;
import com.cbp7.common.exception.DuplicateResourceException;
import com.cbp7.common.exception.ResourceNotFoundException;
import com.cbp7.notification.event.NotificationEventPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AttendanceServiceImpl implements AttendanceService {

    private final AttendanceRecordRepository attendanceRecordRepository;
    private final AttendanceSessionRepository sessionRepository;
    private final AttendanceQrService attendanceQrService;
    private final NotificationEventPublisher notificationEventPublisher;
    private final UserRepository userRepository;
    private final CbpRegistrationRepository cbpRegistrationRepository;

    @Override
    @Transactional
    public ScanAttendanceResponse scanAttendanceQr(String qrToken, String volunteerId) {
        if (qrToken == null || qrToken.isBlank()) {
            throw new IllegalArgumentException("QR token must not be empty");
        }

        AttendanceQrCode qrCode = attendanceQrService.validateQrToken(qrToken);

        String targetStudentId = qrCode.getStudentId();
        if (targetStudentId == null || targetStudentId.equals("SESSION_DEFAULT")) {
            throw new IllegalArgumentException("Scanned QR token is not a student-specific QR code.");
        }

        String cleanStudentId = targetStudentId.trim().toLowerCase();

        AttendanceSession session = sessionRepository.findById(qrCode.getSessionId())
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with ID: " + qrCode.getSessionId()));

        if (session.getStatus() != SessionStatus.ACTIVE) {
            throw new IllegalStateException("Attendance session is not ACTIVE. Current status: " + session.getStatus());
        }

        if (attendanceRecordRepository.existsBySessionIdAndStudentId(session.getId(), cleanStudentId)) {
            throw new DuplicateResourceException("Attendance already marked for student " + cleanStudentId + " in session Day " + session.getDayNumber());
        }

        LocalDateTime now = LocalDateTime.now();

        AttendanceRecord record = AttendanceRecord.builder()
                .sessionId(session.getId())
                .studentId(cleanStudentId)
                .qrCodeId(qrCode.getId())
                .markedBy(volunteerId != null ? volunteerId : "volunteer")
                .markedAt(now)
                .status(AttendanceStatus.PRESENT)
                .build();

        AttendanceRecord saved = attendanceRecordRepository.save(record);
        log.info("Scanned attendance marked for student {} in session Day {} by {}", cleanStudentId, session.getDayNumber(), volunteerId);

        publishAttendanceMarkedEvent(saved);

        String studentName = resolveStudentName(cleanStudentId);

        return new ScanAttendanceResponse(
                true,
                studentName,
                cleanStudentId,
                "Day " + session.getDayNumber() + ": " + session.getTitle(),
                now
        );
    }

    @Override
    @Transactional
    public AttendanceRecordResponse markAttendanceViaQr(String qrToken, String studentId, String volunteerId) {
        if (qrToken == null || qrToken.isBlank()) {
            throw new IllegalArgumentException("QR token must not be empty");
        }
        if (studentId == null || studentId.isBlank()) {
            throw new IllegalArgumentException("Student ID must not be empty");
        }

        AttendanceQrCode qrCode = attendanceQrService.validateQrToken(qrToken);
        AttendanceSession session = sessionRepository.findById(qrCode.getSessionId())
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with ID: " + qrCode.getSessionId()));

        if (session.getStatus() != SessionStatus.ACTIVE) {
            throw new IllegalStateException("Attendance session is not ACTIVE. Current status: " + session.getStatus());
        }

        String cleanStudentId = studentId.trim().toLowerCase();
        if (attendanceRecordRepository.existsBySessionIdAndStudentId(session.getId(), cleanStudentId)) {
            throw new DuplicateResourceException("Attendance already marked for student " + cleanStudentId + " in session Day " + session.getDayNumber());
        }

        LocalDateTime now = LocalDateTime.now();
        AttendanceRecord record = AttendanceRecord.builder()
                .sessionId(session.getId())
                .studentId(cleanStudentId)
                .qrCodeId(qrCode.getId())
                .markedBy(volunteerId != null ? volunteerId : "system")
                .markedAt(now)
                .status(AttendanceStatus.PRESENT)
                .build();

        AttendanceRecord saved = attendanceRecordRepository.save(record);
        publishAttendanceMarkedEvent(saved);

        return AttendanceRecordResponse.fromEntity(saved);
    }

    @Override
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
                .markedBy(markedBy != null ? markedBy : "admin")
                .markedAt(LocalDateTime.now())
                .status(AttendanceStatus.PRESENT)
                .build();

        AttendanceRecord saved = attendanceRecordRepository.save(record);
        publishAttendanceMarkedEvent(saved);

        return AttendanceRecordResponse.fromEntity(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceRecordResponse> getSessionAttendanceRecords(UUID sessionId) {
        return attendanceRecordRepository.findBySessionId(sessionId).stream()
                .map(AttendanceRecordResponse::fromEntity)
                .toList();
    }

    @Override
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

    // --- Private Helper Methods ---

    private String resolveStudentName(String cleanStudentId) {
        Optional<CbpRegistration> regOpt = cbpRegistrationRepository.findByUserStudentIdIgnoreCase(cleanStudentId);
        if (regOpt.isPresent()) {
            CbpRegistration reg = regOpt.get();
            return reg.getFirstName() + " " + reg.getLastName();
        }
        return cleanStudentId;
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
}
