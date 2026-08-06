package com.cbp7.attendance.qr.service;

import com.cbp7.attendance.qr.dto.AttendanceQrResponse;
import com.cbp7.attendance.qr.entity.AttendanceQrCode;
import com.cbp7.attendance.qr.event.AttendanceQrGeneratedEvent;
import com.cbp7.attendance.qr.generator.QrImageGenerator;
import com.cbp7.attendance.qr.repository.AttendanceQrRepository;
import com.cbp7.auth.entity.User;
import com.cbp7.auth.repository.UserRepository;
import com.cbp7.common.exception.ResourceNotFoundException;
import com.cbp7.notification.event.NotificationEventPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AttendanceQrService {

    private final AttendanceQrRepository attendanceQrRepository;
    private final QrImageGenerator qrImageGenerator;
    private final NotificationEventPublisher notificationEventPublisher;
    private final UserRepository userRepository;

    private static final String TOKEN_PREFIX = "CBP_ATTENDANCE_";

    @Transactional
    public AttendanceQrCode generateQrForStudent(String studentId) {
        if (studentId == null || studentId.isBlank()) {
            throw new IllegalArgumentException("Student ID must not be empty");
        }

        return attendanceQrRepository.findByStudentIdAndActiveTrue(studentId)
                .orElseGet(() -> {
                    String token = TOKEN_PREFIX + UUID.randomUUID();
                    AttendanceQrCode qrCode = AttendanceQrCode.builder()
                            .studentId(studentId)
                            .token(token)
                            .active(true)
                            .build();

                    AttendanceQrCode saved = attendanceQrRepository.save(qrCode);
                    log.info("Generated Attendance QR code with ID {} for student {}", saved.getId(), studentId);

                    publishAttendanceQrGeneratedEvent(saved);

                    return saved;
                });
    }

    private void publishAttendanceQrGeneratedEvent(AttendanceQrCode qrCode) {
        try {
            String name = "";
            String email = "";
            Optional<User> userOpt = userRepository.findByStudentId(qrCode.getStudentId());
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                name = user.getName() != null ? user.getName() : "";
                email = user.getEmail() != null ? user.getEmail() : "";
            }

            AttendanceQrGeneratedEvent event = new AttendanceQrGeneratedEvent(
                    qrCode.getStudentId(),
                    name,
                    email,
                    qrCode.getToken()
            );

            notificationEventPublisher.publish(event);
        } catch (Exception e) {
            log.error("Failed to publish AttendanceQrGeneratedEvent for student: {}", qrCode.getStudentId(), e);
        }
    }

    @Transactional(readOnly = true)
    public AttendanceQrResponse getStudentQr(String studentId) {
        if (studentId == null || studentId.isBlank()) {
            throw new IllegalArgumentException("Student ID must not be empty");
        }

        AttendanceQrCode qrCode = attendanceQrRepository.findByStudentIdAndActiveTrue(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance QR code not found for student: " + studentId));

        String qrImage = qrImageGenerator.generateBase64DataUri(qrCode.getToken());
        return new AttendanceQrResponse(qrCode.getId(), qrCode.getToken(), qrImage);
    }

    @Transactional(readOnly = true)
    public byte[] generateQrImage(String token) {
        if (token == null || token.isBlank()) {
            throw new IllegalArgumentException("Token must not be empty");
        }

        AttendanceQrCode qrCode = attendanceQrRepository.findByToken(token)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance QR code not found for token: " + token));

        if (!qrCode.isActive()) {
            throw new IllegalStateException("Attendance QR code is inactive");
        }

        return qrImageGenerator.generatePngBytes(token);
    }
}
