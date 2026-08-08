package com.cbp7.attendance.session.controller;

import com.cbp7.attendance.qr.dto.SessionQrCodeResponse;
import com.cbp7.attendance.qr.service.AttendanceQrService;
import com.cbp7.attendance.record.dto.AdminAttendanceSummaryResponse;
import com.cbp7.attendance.record.dto.AttendanceRecordResponse;
import com.cbp7.attendance.record.service.AttendanceQueryService;
import com.cbp7.attendance.record.service.AttendanceService;
import com.cbp7.attendance.session.dto.CreateAttendanceSessionRequest;
import com.cbp7.attendance.session.dto.AttendanceSessionResponse;
import com.cbp7.attendance.session.entity.SessionStatus;
import com.cbp7.attendance.session.service.AttendanceSessionService;
import com.cbp7.auth.entity.User;
import com.cbp7.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/attendance")
@RequiredArgsConstructor
public class AdminAttendanceSessionController {

    private final AttendanceSessionService sessionService;
    private final AttendanceQrService qrService;
    private final AttendanceService attendanceService;
    private final AttendanceQueryService attendanceQueryService;

    @PostMapping("/sessions")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AttendanceSessionResponse>> createSession(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody CreateAttendanceSessionRequest request
    ) {
        String adminId = currentUser != null ? currentUser.getStudentId() : "system";
        AttendanceSessionResponse response = sessionService.createSession(request, adminId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Attendance session created successfully", response));
    }

    @GetMapping("/sessions")
    @PreAuthorize("hasAnyRole('ADMIN', 'VOLUNTEER')")
    public ResponseEntity<ApiResponse<List<AttendanceSessionResponse>>> getAllSessions() {
        List<AttendanceSessionResponse> response = sessionService.getAllSessions();
        return ResponseEntity.ok(ApiResponse.success("Attendance sessions retrieved successfully", response));
    }

    @GetMapping("/sessions/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'VOLUNTEER')")
    public ResponseEntity<ApiResponse<AttendanceSessionResponse>> getSessionById(@PathVariable UUID id) {
        AttendanceSessionResponse response = sessionService.getSessionById(id);
        return ResponseEntity.ok(ApiResponse.success("Attendance session retrieved successfully", response));
    }

    @PatchMapping("/sessions/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AttendanceSessionResponse>> updateSessionStatus(
            @PathVariable UUID id,
            @RequestParam SessionStatus status
    ) {
        AttendanceSessionResponse response = sessionService.updateSessionStatus(id, status);
        return ResponseEntity.ok(ApiResponse.success("Session status updated successfully", response));
    }

    @DeleteMapping("/sessions/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteSession(@PathVariable UUID id) {
        sessionService.deleteSession(id);
        return ResponseEntity.ok(ApiResponse.success("Session deleted successfully", null));
    }

    @PostMapping("/sessions/{id}/qr")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SessionQrCodeResponse>> generateSessionQr(
            @PathVariable UUID id,
            @RequestParam(required = false, defaultValue = "120") Integer validMinutes
    ) {
        SessionQrCodeResponse response = qrService.generateSessionQr(id, validMinutes);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Session QR code generated successfully", response));
    }

    @GetMapping("/sessions/{id}/qr")
    @PreAuthorize("hasAnyRole('ADMIN', 'VOLUNTEER')")
    public ResponseEntity<ApiResponse<SessionQrCodeResponse>> getActiveSessionQr(@PathVariable UUID id) {
        SessionQrCodeResponse response = qrService.getActiveSessionQr(id);
        return ResponseEntity.ok(ApiResponse.success("Active session QR code retrieved successfully", response));
    }

    @DeleteMapping("/sessions/{id}/qr")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deactivateSessionQr(@PathVariable UUID id) {
        qrService.deactivateSessionQr(id);
        return ResponseEntity.ok(ApiResponse.success("Session QR code deactivated successfully", null));
    }

    @GetMapping("/sessions/{id}/records")
    @PreAuthorize("hasAnyRole('ADMIN', 'VOLUNTEER')")
    public ResponseEntity<ApiResponse<List<AttendanceRecordResponse>>> getSessionAttendanceRecords(@PathVariable UUID id) {
        List<AttendanceRecordResponse> response = attendanceService.getSessionAttendanceRecords(id);
        return ResponseEntity.ok(ApiResponse.success("Session attendance records retrieved successfully", response));
    }
}
