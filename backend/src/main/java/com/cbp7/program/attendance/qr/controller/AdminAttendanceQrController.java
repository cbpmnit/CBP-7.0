package com.cbp7.program.attendance.qr.controller;

import com.cbp7.program.attendance.qr.dto.response.SessionQrCodeResponse;
import com.cbp7.program.attendance.qr.service.AttendanceQrService;
import com.cbp7.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping({"/api/v1/admin/attendance/qr", "/api/admin/attendance/qr"})
@RequiredArgsConstructor
public class AdminAttendanceQrController {

    private final AttendanceQrService attendanceQrService;

    @PostMapping("/session/{sessionId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SessionQrCodeResponse>> generateSessionQr(@PathVariable UUID sessionId) {
        SessionQrCodeResponse response = attendanceQrService.generateSessionQr(sessionId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Session QR code generated successfully", response));
    }

    @GetMapping("/session/{sessionId}")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('SESSION_VIEW') or hasAuthority('ATTENDANCE_VIEW')")
    public ResponseEntity<ApiResponse<SessionQrCodeResponse>> getSessionQr(@PathVariable UUID sessionId) {
        SessionQrCodeResponse response = attendanceQrService.getActiveSessionQr(sessionId);
        return ResponseEntity.ok(ApiResponse.success("Active session QR code retrieved successfully", response));
    }
}
