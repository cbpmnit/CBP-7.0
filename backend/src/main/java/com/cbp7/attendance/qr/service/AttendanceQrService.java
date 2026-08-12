package com.cbp7.attendance.qr.service;

import com.cbp7.attendance.qr.dto.response.BatchQrGenerationResponse;
import com.cbp7.attendance.qr.dto.response.QrGenerationStatusResponse;
import com.cbp7.attendance.qr.dto.response.SessionQrCodeResponse;
import com.cbp7.attendance.qr.dto.response.StudentSessionQrResponse;
import com.cbp7.attendance.qr.entity.AttendanceQrCode;

import java.util.UUID;

public interface AttendanceQrService {

    BatchQrGenerationResponse generateStudentQrsForSession(UUID sessionId);

    QrGenerationStatusResponse getQrGenerationStatus(UUID sessionId);

    StudentSessionQrResponse getStudentSessionQr(UUID sessionId, String studentId);

    SessionQrCodeResponse generateSessionQr(UUID sessionId);

    SessionQrCodeResponse getActiveSessionQr(UUID sessionId);

    void deactivateSessionQr(UUID sessionId);

    AttendanceQrCode validateQrToken(String token);

    byte[] generateQrImage(String token);
}
