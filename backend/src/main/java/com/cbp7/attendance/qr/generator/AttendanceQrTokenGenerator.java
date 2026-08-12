package com.cbp7.attendance.qr.generator;

import com.cbp7.attendance.session.entity.AttendanceSession;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.UUID;

@Component
public class AttendanceQrTokenGenerator {

    public String generateSessionDefaultToken() {
        return "CBP_SESSION_QR_" + UUID.randomUUID().toString().replace("-", "");
    }

    public String generateStudentToken(UUID sessionId, String studentId) {
        return "CBP_ATT_QR_" + sessionId.toString().substring(0, 8) + "_" + studentId.toLowerCase() + "_" + UUID.randomUUID().toString().substring(0, 8);
    }

    public LocalDateTime calculateExpiry(AttendanceSession session) {
        if (session == null || session.getSessionDate() == null) {
            return LocalDateTime.now().plusHours(4);
        }
        return session.getEndTime() != null
                ? LocalDateTime.of(session.getSessionDate(), session.getEndTime())
                : session.getSessionDate().atTime(23, 59, 59);
    }
}
