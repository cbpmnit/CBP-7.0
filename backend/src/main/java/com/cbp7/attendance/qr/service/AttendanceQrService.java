package com.cbp7.attendance.qr.service;

import com.cbp7.attendance.qr.dto.SessionQrCodeResponse;
import com.cbp7.attendance.qr.entity.AttendanceQrCode;
import com.cbp7.attendance.qr.generator.QrImageGenerator;
import com.cbp7.attendance.qr.repository.AttendanceQrRepository;
import com.cbp7.attendance.session.entity.AttendanceSession;
import com.cbp7.attendance.session.repository.AttendanceSessionRepository;
import com.cbp7.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AttendanceQrService {

    private final AttendanceQrRepository attendanceQrRepository;
    private final AttendanceSessionRepository sessionRepository;
    private final QrImageGenerator qrImageGenerator;

    private static final String TOKEN_PREFIX = "CBP_SESSION_QR_";

    @Transactional
    public SessionQrCodeResponse generateSessionQr(UUID sessionId) {
        AttendanceSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Session not found with ID: " + sessionId));

        // Deactivate any existing active QR code for this session
        attendanceQrRepository.findBySessionIdAndActiveTrue(sessionId).ifPresent(qr -> {
            qr.setActive(false);
            attendanceQrRepository.save(qr);
        });

        String token = TOKEN_PREFIX + UUID.randomUUID().toString().replace("-", "");
        LocalDateTime now = LocalDateTime.now();
        
        // Expiry is strictly derived from session.endTime on sessionDate
        LocalDateTime expiresAt = session.getEndTime() != null
                ? LocalDateTime.of(session.getSessionDate(), session.getEndTime())
                : session.getSessionDate().atTime(23, 59, 59);

        AttendanceQrCode qrCode = AttendanceQrCode.builder()
                .sessionId(sessionId)
                .token(token)
                .generatedAt(now)
                .expiresAt(expiresAt)
                .active(true)
                .build();

        AttendanceQrCode saved = attendanceQrRepository.save(qrCode);
        log.info("Generated Session QR code ID {} for session Day {}", saved.getId(), session.getDayNumber());

        String qrImage = qrImageGenerator.generateBase64DataUri(saved.getToken());
        return SessionQrCodeResponse.fromEntity(saved, qrImage);
    }

    @Transactional(readOnly = true)
    public SessionQrCodeResponse getActiveSessionQr(UUID sessionId) {
        AttendanceQrCode qrCode = attendanceQrRepository.findBySessionIdAndActiveTrue(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Active QR code not found for session ID: " + sessionId));

        String qrImage = qrImageGenerator.generateBase64DataUri(qrCode.getToken());
        return SessionQrCodeResponse.fromEntity(qrCode, qrImage);
    }

    @Transactional
    public void deactivateSessionQr(UUID sessionId) {
        attendanceQrRepository.findBySessionIdAndActiveTrue(sessionId).ifPresent(qr -> {
            qr.setActive(false);
            attendanceQrRepository.save(qr);
        });
    }

    @Transactional(readOnly = true)
    public AttendanceQrCode validateQrToken(String token) {
        AttendanceQrCode qrCode = attendanceQrRepository.findByTokenAndActiveTrue(token)
                .orElseThrow(() -> new ResourceNotFoundException("Invalid or inactive session QR token"));

        if (qrCode.getExpiresAt() != null && LocalDateTime.now().isAfter(qrCode.getExpiresAt())) {
            throw new IllegalStateException("Session QR code has expired");
        }

        return qrCode;
    }

    @Transactional(readOnly = true)
    public byte[] generateQrImage(String token) {
        validateQrToken(token);
        return qrImageGenerator.generatePngBytes(token);
    }
}
