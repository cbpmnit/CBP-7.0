package com.cbp7.program.attendance.qr.controller;

import com.cbp7.program.attendance.qr.dto.request.BatchQrGenerationRequest;
import com.cbp7.program.attendance.qr.dto.request.GenerateSelectedQrRequest;
import com.cbp7.program.attendance.qr.dto.request.RegenerateSelectedQrRequest;
import com.cbp7.program.attendance.qr.dto.response.BatchQrGenerationResponse;
import com.cbp7.program.attendance.qr.dto.response.SessionQrCodeResponse;
import com.cbp7.program.attendance.qr.entity.QrGenerationMode;
import com.cbp7.program.attendance.qr.service.AttendanceQrService;
import com.cbp7.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping({"/api/v1/admin/attendance/qr", "/api/admin/attendance/qr", "/api/v1/attendance/qr/admin"})
@RequiredArgsConstructor
public class AdminAttendanceQrController {

    private final AttendanceQrService attendanceQrService;

    @PostMapping("/generate")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('SESSION_EDIT') or hasAuthority('ATTENDANCE_MANAGE')")
    public ResponseEntity<ApiResponse<BatchQrGenerationResponse>> generateBatchStudentQrs(
            @Valid @RequestBody BatchQrGenerationRequest request
    ) {
        BatchQrGenerationResponse response = attendanceQrService.generateStudentQrsForSession(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response.summaryMessage(), response));
    }

    @PostMapping("/generate-selected")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('SESSION_EDIT') or hasAuthority('ATTENDANCE_MANAGE')")
    public ResponseEntity<ApiResponse<BatchQrGenerationResponse>> generateSelectedQrs(
            @Valid @RequestBody GenerateSelectedQrRequest request
    ) {
        BatchQrGenerationResponse response = attendanceQrService.generateSelectedQrs(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response.summaryMessage(), response));
    }

    @PostMapping("/regenerate-selected")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('SESSION_EDIT') or hasAuthority('ATTENDANCE_MANAGE')")
    public ResponseEntity<ApiResponse<BatchQrGenerationResponse>> regenerateSelectedQrs(
            @Valid @RequestBody RegenerateSelectedQrRequest request
    ) {
        BatchQrGenerationResponse response = attendanceQrService.regenerateSelectedQrs(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response.summaryMessage(), response));
    }

    @PostMapping({"/students/session/{sessionId}", "/session/{sessionId}/student-qrs"})
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('SESSION_EDIT') or hasAuthority('ATTENDANCE_MANAGE')")
    public ResponseEntity<ApiResponse<BatchQrGenerationResponse>> generateStudentQrsForSession(
            @PathVariable UUID sessionId
    ) {
        BatchQrGenerationResponse response = attendanceQrService.generateStudentQrsForSession(
                new BatchQrGenerationRequest(sessionId, QrGenerationMode.MISSING_ONLY, null)
        );
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(response.summaryMessage(), response));
    }

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
