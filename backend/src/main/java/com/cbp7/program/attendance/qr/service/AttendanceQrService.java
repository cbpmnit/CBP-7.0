package com.cbp7.program.attendance.qr.service;

import com.cbp7.program.attendance.qr.dto.request.BatchQrGenerationRequest;
import com.cbp7.program.attendance.qr.dto.request.GenerateSelectedQrRequest;
import com.cbp7.program.attendance.qr.dto.request.RegenerateSelectedQrRequest;
import com.cbp7.program.attendance.qr.dto.response.BatchQrGenerationResponse;
import com.cbp7.program.attendance.qr.dto.response.QrGenerationStatusResponse;
import com.cbp7.program.attendance.qr.dto.response.SessionQrCodeResponse;
import com.cbp7.program.attendance.qr.dto.response.StudentSessionQrResponse;
import com.cbp7.program.attendance.qr.entity.AttendanceQrCode;

import java.util.UUID;

public interface AttendanceQrService {

    BatchQrGenerationResponse generateStudentQrsForSession(UUID sessionId);

    BatchQrGenerationResponse generateStudentQrsForSession(BatchQrGenerationRequest request);

    BatchQrGenerationResponse generateSelectedQrs(GenerateSelectedQrRequest request);

    BatchQrGenerationResponse regenerateSelectedQrs(RegenerateSelectedQrRequest request);

    QrGenerationStatusResponse getQrGenerationStatus(UUID sessionId);

    StudentSessionQrResponse getStudentSessionQr(UUID sessionId, String studentId);

    SessionQrCodeResponse generateSessionQr(UUID sessionId);

    SessionQrCodeResponse getActiveSessionQr(UUID sessionId);

    void deactivateSessionQr(UUID sessionId);

    AttendanceQrCode validateQrToken(String token);

    byte[] generateQrImage(String token);
}
