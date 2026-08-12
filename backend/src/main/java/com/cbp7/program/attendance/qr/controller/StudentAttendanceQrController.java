package com.cbp7.program.attendance.qr.controller;

import com.cbp7.program.attendance.qr.dto.response.StudentSessionQrResponse;
import com.cbp7.program.attendance.qr.service.AttendanceQrService;
import com.cbp7.program.attendance.session.dto.response.AttendanceSessionResponse;
import com.cbp7.program.attendance.session.service.AttendanceSessionService;
import com.cbp7.identity.auth.entity.User;
import com.cbp7.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/student/attendance")
@RequiredArgsConstructor
public class StudentAttendanceQrController {

    private final AttendanceQrService qrService;
    private final AttendanceSessionService sessionService;

    @GetMapping("/sessions/{sessionId}/qr")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<StudentSessionQrResponse>> getStudentSessionQr(
            @AuthenticationPrincipal User studentUser,
            @PathVariable UUID sessionId
    ) {
        String studentId = studentUser != null ? studentUser.getStudentId() : "system";
        StudentSessionQrResponse response = qrService.getStudentSessionQr(sessionId, studentId);
        return ResponseEntity.ok(ApiResponse.success("Student session QR code retrieved successfully", response));
    }

    @GetMapping("/qr")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<StudentSessionQrResponse>> getMyActiveAttendanceQr(
            @AuthenticationPrincipal User studentUser
    ) {
        String studentId = studentUser != null ? studentUser.getStudentId() : "system";
        List<AttendanceSessionResponse> visibleSessions = sessionService.getVisibleSessions();
        
        AttendanceSessionResponse activeSession = visibleSessions.stream()
                .filter(s -> s.status() == com.cbp7.program.attendance.session.entity.SessionStatus.ACTIVE
                          || s.status() == com.cbp7.program.attendance.session.entity.SessionStatus.UPCOMING)
                .findFirst()
                .orElse(null);

        if (activeSession == null && !visibleSessions.isEmpty()) {
            activeSession = visibleSessions.get(0);
        }

        if (activeSession == null) {
            return ResponseEntity.ok(ApiResponse.success("No active workshop session found", null));
        }

        StudentSessionQrResponse response = qrService.getStudentSessionQr(activeSession.id(), studentId);
        return ResponseEntity.ok(ApiResponse.success("Active session QR code retrieved successfully", response));
    }

    @GetMapping("/active-qrs")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<List<StudentSessionQrResponse>>> getMyActiveAttendanceQrs(
            @AuthenticationPrincipal User studentUser
    ) {
        String studentId = studentUser != null ? studentUser.getStudentId() : "system";
        List<AttendanceSessionResponse> visibleSessions = sessionService.getVisibleSessions();

        List<StudentSessionQrResponse> activeQrs = visibleSessions.stream()
                .filter(s -> s.status() == com.cbp7.program.attendance.session.entity.SessionStatus.ACTIVE
                          || s.status() == com.cbp7.program.attendance.session.entity.SessionStatus.UPCOMING)
                .map(s -> qrService.getStudentSessionQr(s.id(), studentId))
                .filter(java.util.Objects::nonNull)
                .toList();

        return ResponseEntity.ok(ApiResponse.success("Active session QR codes retrieved successfully", activeQrs));
    }
}
