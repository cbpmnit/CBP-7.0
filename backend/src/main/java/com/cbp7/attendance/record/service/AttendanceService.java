package com.cbp7.attendance.record.service;

import com.cbp7.attendance.qr.entity.AttendanceQrCode;
import com.cbp7.attendance.qr.repository.AttendanceQrRepository;
import com.cbp7.attendance.record.dto.AttendanceRecordResponse;
import com.cbp7.attendance.record.entity.AttendanceRecord;
import com.cbp7.attendance.record.entity.AttendanceStatus;
import com.cbp7.attendance.record.event.AttendanceMarkedEvent;
import com.cbp7.attendance.record.repository.AttendanceRecordRepository;
import com.cbp7.auth.entity.User;
import com.cbp7.auth.repository.UserRepository;
import com.cbp7.common.exception.DuplicateResourceException;
import com.cbp7.common.exception.ResourceNotFoundException;
import com.cbp7.notification.event.NotificationEventPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class AttendanceService {

    private final AttendanceRecordRepository attendanceRecordRepository;
    private final AttendanceQrRepository attendanceQrRepository;
    private final NotificationEventPublisher notificationEventPublisher;
    private final UserRepository userRepository;

    @Transactional
    public AttendanceRecordResponse markAttendance(String qrToken, String volunteerId) {
        if (qrToken == null || qrToken.isBlank()) {
            throw new IllegalArgumentException("QR token must not be empty");
        }
        if (volunteerId == null || volunteerId.isBlank()) {
            throw new IllegalArgumentException("Volunteer ID must not be empty");
        }

        AttendanceQrCode qrCode = attendanceQrRepository.findByToken(qrToken)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid QR token: " + qrToken));

        if (!qrCode.isActive()) {
            throw new IllegalStateException("Attendance QR code is inactive");
        }

        String studentId = qrCode.getStudentId();
        LocalDate today = LocalDate.now();

        if (attendanceRecordRepository.existsByStudentIdAndAttendanceDate(studentId, today)) {
            throw new DuplicateResourceException("Attendance already marked for student " + studentId + " on " + today);
        }

        AttendanceRecord record = AttendanceRecord.builder()
                .studentId(studentId)
                .qrCodeId(qrCode.getId())
                .markedBy(volunteerId)
                .attendanceDate(today)
                .attendanceTime(LocalDateTime.now())
                .status(AttendanceStatus.PRESENT)
                .build();

        AttendanceRecord saved = attendanceRecordRepository.save(record);
        log.info("Attendance marked for student {} on {} by volunteer {}", studentId, today, volunteerId);

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
                    record.getAttendanceDate(),
                    record.getAttendanceTime(),
                    record.getStatus()
            );

            notificationEventPublisher.publish(event);
        } catch (Exception e) {
            log.error("Failed to publish AttendanceMarkedEvent for student: {}", record.getStudentId(), e);
        }
    }

    @Transactional(readOnly = true)
    public List<AttendanceRecordResponse> getAttendanceForDate(LocalDate date) {
        if (date == null) {
            throw new IllegalArgumentException("Date must not be null");
        }
        return attendanceRecordRepository.findByAttendanceDate(date)
                .stream()
                .map(AttendanceRecordResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AttendanceRecordResponse> getStudentAttendanceHistory(String studentId) {
        if (studentId == null || studentId.isBlank()) {
            throw new IllegalArgumentException("Student ID must not be empty");
        }
        return attendanceRecordRepository.findByStudentId(studentId)
                .stream()
                .map(AttendanceRecordResponse::fromEntity)
                .toList();
    }
}
