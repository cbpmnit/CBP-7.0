package com.cbp7.program.attendance.record;

import com.cbp7.program.attendance.qr.entity.AttendanceQrCode;
import com.cbp7.program.attendance.session.entity.AttendanceSession;
import com.cbp7.program.attendance.session.entity.SessionStatus;
import com.cbp7.identity.auth.entity.User;
import com.cbp7.common.exception.DuplicateResourceException;
import com.cbp7.common.exception.UnauthorizedException;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
public class AttendanceValidator {

    public void validateScannerUser(User user) {
        if (user == null) {
            throw new UnauthorizedException("User is not authenticated");
        }
    }

    public void validateSessionForScan(AttendanceSession session) {
        if (session == null || session.getStatus() != SessionStatus.ACTIVE) {
            throw new IllegalStateException("Session is not active for attendance scanning");
        }
    }

    public void validateQrToken(AttendanceQrCode qrCode, AttendanceSession session) {
        if (qrCode == null) {
            throw new IllegalArgumentException("Invalid QR token");
        }
        if (qrCode.getExpiresAt() != null && qrCode.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("QR token has expired");
        }
        if (qrCode.getSessionId() != null && session != null && !qrCode.getSessionId().equals(session.getId())) {
            throw new IllegalArgumentException("QR code does not belong to the selected session");
        }
    }

    public void validateNoDuplicateScan(boolean duplicateExists, String studentId, int dayNumber) {
        if (duplicateExists) {
            throw new DuplicateResourceException(
                    String.format("Attendance already marked for student %s in session Day %d", studentId, dayNumber)
            );
        }
    }
}
