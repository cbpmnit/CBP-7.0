package com.cbp7.attendance.qr.service;

import com.cbp7.attendance.qr.dto.BatchQrGenerationResponse;
import com.cbp7.attendance.qr.dto.QrGenerationStatusResponse;
import com.cbp7.attendance.qr.dto.SessionQrCodeResponse;
import com.cbp7.attendance.qr.dto.StudentSessionQrResponse;
import com.cbp7.attendance.qr.entity.AttendanceQrCode;
import com.cbp7.attendance.qr.generator.QrImageGenerator;
import com.cbp7.attendance.qr.repository.AttendanceQrRepository;
import com.cbp7.attendance.session.entity.AttendanceSession;
import com.cbp7.attendance.session.repository.AttendanceSessionRepository;
import com.cbp7.cbp.entity.CbpRegistration;
import com.cbp7.cbp.repository.CbpRegistrationRepository;
import com.cbp7.common.exception.ResourceNotFoundException;
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
public class AttendanceQrServiceImpl implements AttendanceQrService {

    private final AttendanceQrRepository attendanceQrRepository;
    private final AttendanceSessionRepository sessionRepository;
    private final CbpRegistrationRepository cbpRegistrationRepository;
    private final QrImageGenerator qrImageGenerator;

    private static final String TOKEN_PREFIX = "CBP_STUDENT_QR_";

    @Override
    @Transactional
    public BatchQrGenerationResponse generateStudentQrsForSession(UUID sessionId) {
        AttendanceSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with ID: " + sessionId));

        List<CbpRegistration> registeredStudents = cbpRegistrationRepository.findAll();
        long totalStudents = registeredStudents.size();
        long generatedCount = 0;

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiresAt = session.getEndTime() != null
                ? LocalDateTime.of(session.getSessionDate(), session.getEndTime())
                : session.getSessionDate().atTime(23, 59, 59);

        for (CbpRegistration student : registeredStudents) {
            String studentId = student.getStudentId();
            if (studentId == null || studentId.isBlank()) continue;

            // Deactivate previous active QR for this student and session
            attendanceQrRepository.findBySessionIdAndStudentIdAndActiveTrue(sessionId, studentId).ifPresent(qr -> {
                qr.setActive(false);
                attendanceQrRepository.save(qr);
            });

            String token = TOKEN_PREFIX + studentId + "_" + sessionId + "_" + UUID.randomUUID().toString().substring(0, 8);

            AttendanceQrCode qrCode = AttendanceQrCode.builder()
                    .sessionId(sessionId)
                    .studentId(studentId)
                    .token(token)
                    .generatedAt(now)
                    .expiresAt(expiresAt)
                    .active(true)
                    .build();

            attendanceQrRepository.save(qrCode);
            generatedCount++;
        }

        log.info("Generated {} student QR codes for session Day {}", generatedCount, session.getDayNumber());
        return new BatchQrGenerationResponse(totalStudents, generatedCount);
    }

    @Override
    @Transactional(readOnly = true)
    public QrGenerationStatusResponse getQrGenerationStatus(UUID sessionId) {
        long totalStudents = cbpRegistrationRepository.count();
        long generatedQr = attendanceQrRepository.countBySessionIdAndActiveTrue(sessionId);
        long pendingQr = Math.max(0, totalStudents - generatedQr);
        return new QrGenerationStatusResponse(totalStudents, generatedQr, pendingQr);
    }

    @Override
    @Transactional
    public StudentSessionQrResponse getStudentSessionQr(UUID sessionId, String studentId) {
        AttendanceSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with ID: " + sessionId));

        Optional<AttendanceQrCode> existingQr = attendanceQrRepository.findBySessionIdAndStudentIdAndActiveTrue(sessionId, studentId);
        AttendanceQrCode qrCode;

        if (existingQr.isPresent()) {
            qrCode = existingQr.get();
        } else {
            // QR codes should NOT exist for students until admin generates them
            return null;
        }

        String qrImage = qrImageGenerator.generateBase64DataUri(qrCode.getToken());
        return new StudentSessionQrResponse(
                session.getId(),
                session.getDayNumber(),
                session.getTitle(),
                session.getSessionDate() != null ? session.getSessionDate().toString() : "",
                session.getStartTime() != null ? session.getStartTime().toString() : "",
                session.getEndTime() != null ? session.getEndTime().toString() : "",
                session.getVenue() != null ? session.getVenue() : "VLTC Auditorium, MNIT",
                qrCode.getToken(),
                qrImage,
                qrCode.getExpiresAt() != null ? qrCode.getExpiresAt().toString() : ""
        );
    }

    @Override
    @Transactional
    public SessionQrCodeResponse generateSessionQr(UUID sessionId) {
        AttendanceSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with ID: " + sessionId));

        String defaultStudentId = "SESSION_DEFAULT";
        attendanceQrRepository.findBySessionIdAndStudentIdAndActiveTrue(sessionId, defaultStudentId).ifPresent(qr -> {
            qr.setActive(false);
            attendanceQrRepository.save(qr);
        });

        String token = "CBP_SESSION_QR_" + UUID.randomUUID().toString().replace("-", "");
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime expiresAt = session.getEndTime() != null
                ? LocalDateTime.of(session.getSessionDate(), session.getEndTime())
                : session.getSessionDate().atTime(23, 59, 59);

        AttendanceQrCode qrCode = AttendanceQrCode.builder()
                .sessionId(sessionId)
                .studentId(defaultStudentId)
                .token(token)
                .generatedAt(now)
                .expiresAt(expiresAt)
                .active(true)
                .build();

        AttendanceQrCode saved = attendanceQrRepository.save(qrCode);
        String qrImage = qrImageGenerator.generateBase64DataUri(saved.getToken());
        return SessionQrCodeResponse.fromEntity(saved, qrImage);
    }

    @Override
    @Transactional(readOnly = true)
    public SessionQrCodeResponse getActiveSessionQr(UUID sessionId) {
        AttendanceQrCode qrCode = attendanceQrRepository.findBySessionIdAndActiveTrue(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Active QR code not found for session ID: " + sessionId));

        String qrImage = qrImageGenerator.generateBase64DataUri(qrCode.getToken());
        return SessionQrCodeResponse.fromEntity(qrCode, qrImage);
    }

    @Override
    @Transactional
    public void deactivateSessionQr(UUID sessionId) {
        attendanceQrRepository.findBySessionIdAndActiveTrue(sessionId).ifPresent(qr -> {
            qr.setActive(false);
            attendanceQrRepository.save(qr);
        });
    }

    @Override
    @Transactional(readOnly = true)
    public AttendanceQrCode validateQrToken(String token) {
        AttendanceQrCode qrCode = attendanceQrRepository.findByTokenAndActiveTrue(token)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid or inactive session QR token: " + token));

        if (qrCode.getExpiresAt() != null && LocalDateTime.now().isAfter(qrCode.getExpiresAt())) {
            throw new IllegalStateException("Session QR code has expired");
        }

        return qrCode;
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] generateQrImage(String token) {
        validateQrToken(token);
        return qrImageGenerator.generatePngBytes(token);
    }
}
