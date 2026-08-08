package com.cbp7.attendance.session.controller;

import com.cbp7.attendance.session.dto.AttendanceSessionResponse;
import com.cbp7.attendance.session.entity.SessionStatus;
import com.cbp7.attendance.session.service.AttendanceSessionService;
import com.cbp7.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/attendance/sessions")
@RequiredArgsConstructor
public class AttendanceSessionController {

    private final AttendanceSessionService sessionService;

    @GetMapping("/upcoming")
    public ResponseEntity<ApiResponse<AttendanceSessionResponse>> getUpcomingSession() {
        List<AttendanceSessionResponse> sessions = sessionService.getVisibleSessions();
        AttendanceSessionResponse next = sessions.stream()
                .filter(s -> s.status() == SessionStatus.ACTIVE || s.status() == SessionStatus.UPCOMING)
                .findFirst()
                .orElse(null);
        return ResponseEntity.ok(ApiResponse.success("Upcoming session retrieved successfully", next));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<AttendanceSessionResponse>>> getVisibleSessions() {
        List<AttendanceSessionResponse> sessions = sessionService.getVisibleSessions();
        return ResponseEntity.ok(ApiResponse.success("Visible attendance sessions retrieved successfully", sessions));
    }
}
