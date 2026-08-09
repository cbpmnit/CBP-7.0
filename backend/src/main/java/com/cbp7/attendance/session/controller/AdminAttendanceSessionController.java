package com.cbp7.attendance.session.controller;

import com.cbp7.attendance.qr.dto.BatchQrGenerationResponse;
import com.cbp7.attendance.qr.dto.QrGenerationStatusResponse;
import com.cbp7.attendance.qr.dto.SessionQrCodeResponse;
import com.cbp7.attendance.qr.service.AttendanceQrService;
import com.cbp7.attendance.record.dto.StudentSessionRecordDto;
import com.cbp7.attendance.record.entity.AttendanceStatus;
import com.cbp7.attendance.record.service.AttendanceQueryService;
import com.cbp7.attendance.session.dto.AttendanceSessionResponse;
import com.cbp7.attendance.session.dto.CreateAttendanceSessionRequest;
import com.cbp7.attendance.session.dto.SessionSummaryResponse;
import com.cbp7.attendance.session.dto.UpdateAttendanceSessionRequest;
import com.cbp7.attendance.session.service.AttendanceSessionService;
import com.cbp7.auth.entity.User;
import com.cbp7.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/attendance/sessions")
@RequiredArgsConstructor
public class AdminAttendanceSessionController {

    private final AttendanceSessionService sessionService;
    private final AttendanceQrService qrService;
    private final AttendanceQueryService attendanceQueryService;

    @PostMapping
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

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasRole('VOLUNTEER') or hasAuthority('SESSION_VIEW') or hasAuthority('ATTENDANCE_VIEW')")
    public ResponseEntity<ApiResponse<List<AttendanceSessionResponse>>> getAllSessions() {
        List<AttendanceSessionResponse> response = sessionService.getAllSessions();
        return ResponseEntity.ok(ApiResponse.success("Attendance sessions retrieved successfully", response));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('VOLUNTEER') or hasAuthority('SESSION_VIEW') or hasAuthority('ATTENDANCE_VIEW')")
    public ResponseEntity<ApiResponse<AttendanceSessionResponse>> getSessionById(@PathVariable UUID id) {
        AttendanceSessionResponse response = sessionService.getSessionById(id);
        return ResponseEntity.ok(ApiResponse.success("Attendance session retrieved successfully", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('SESSION_EDIT') or hasAuthority('SESSION_MANAGE')")
    public ResponseEntity<ApiResponse<com.cbp7.attendance.session.dto.SessionUpdateResponse>> updateSession(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateAttendanceSessionRequest request
    ) {
        AttendanceSessionResponse response = sessionService.updateSession(id, request);
        com.cbp7.attendance.session.dto.SessionUpdateResponse updateResponse = com.cbp7.attendance.session.dto.SessionUpdateResponse.fromResponse(
                "Session updated successfully. Attendance validity synchronized.",
                true,
                response
        );
        return ResponseEntity.ok(ApiResponse.success("Session updated successfully. Attendance validity synchronized.", updateResponse));
    }

    @PatchMapping("/{id}/visibility")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AttendanceSessionResponse>> updateSessionVisibility(
            @PathVariable UUID id,
            @RequestParam boolean visibility
    ) {
        AttendanceSessionResponse response = sessionService.setSessionVisibility(id, visibility);
        return ResponseEntity.ok(ApiResponse.success("Session visibility updated successfully", response));
    }

    @PostMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AttendanceSessionResponse>> activateSession(@PathVariable UUID id) {
        AttendanceSessionResponse response = sessionService.activateSession(id);
        return ResponseEntity.ok(ApiResponse.success("Session attendance activated successfully", response));
    }

    @PostMapping("/{id}/close")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AttendanceSessionResponse>> closeSession(@PathVariable UUID id) {
        AttendanceSessionResponse response = sessionService.closeSession(id);
        return ResponseEntity.ok(ApiResponse.success("Session attendance closed successfully", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteSession(@PathVariable UUID id) {
        sessionService.deleteSession(id);
        return ResponseEntity.ok(ApiResponse.success("Session deleted successfully", null));
    }

    @PostMapping("/{id}/generate-student-qrs")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BatchQrGenerationResponse>> generateStudentQrsForSession(@PathVariable UUID id) {
        BatchQrGenerationResponse response = qrService.generateStudentQrsForSession(id);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Student QR codes generated successfully for session", response));
    }

    @GetMapping("/{id}/qr-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<QrGenerationStatusResponse>> getQrGenerationStatus(@PathVariable UUID id) {
        QrGenerationStatusResponse response = qrService.getQrGenerationStatus(id);
        return ResponseEntity.ok(ApiResponse.success("QR generation status retrieved successfully", response));
    }

    @PostMapping("/{id}/qr")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SessionQrCodeResponse>> generateSessionQr(@PathVariable UUID id) {
        SessionQrCodeResponse response = qrService.generateSessionQr(id);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Session QR code generated successfully", response));
    }

    @GetMapping("/{id}/qr")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('ATTENDANCE_SCAN')")
    public ResponseEntity<ApiResponse<SessionQrCodeResponse>> getActiveSessionQr(@PathVariable UUID id) {
        SessionQrCodeResponse response = qrService.getActiveSessionQr(id);
        return ResponseEntity.ok(ApiResponse.success("Active session QR code retrieved successfully", response));
    }

    @DeleteMapping("/{id}/qr")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deactivateSessionQr(@PathVariable UUID id) {
        qrService.deactivateSessionQr(id);
        return ResponseEntity.ok(ApiResponse.success("Session QR code deactivated successfully", null));
    }

    @GetMapping("/{id}/summary")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SessionSummaryResponse>> getSessionSummary(@PathVariable UUID id) {
        SessionSummaryResponse response = attendanceQueryService.getSessionSummary(id);
        return ResponseEntity.ok(ApiResponse.success("Session summary retrieved successfully", response));
    }

    @GetMapping("/{id}/records")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('ATTENDANCE_VIEW')")
    public ResponseEntity<ApiResponse<Page<StudentSessionRecordDto>>> getSessionAttendanceRecords(
            @PathVariable UUID id,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) AttendanceStatus status,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        Page<StudentSessionRecordDto> response = attendanceQueryService.getSessionRecordsPaginated(id, search, status, pageable);
        return ResponseEntity.ok(ApiResponse.success("Session attendance records retrieved successfully", response));
    }
}
