package com.cbp7.attendance.record.controller;

import com.cbp7.attendance.record.dto.AttendanceRecordResponse;
import com.cbp7.attendance.record.dto.MarkAttendanceRequest;
import com.cbp7.attendance.record.service.AttendanceService;
import com.cbp7.auth.entity.User;
import com.cbp7.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/attendance")
@RequiredArgsConstructor
public class VolunteerAttendanceController {

    private final AttendanceService attendanceService;

    @PostMapping("/mark")
    @PreAuthorize("hasAnyRole('VOLUNTEER', 'ADMIN')")
    public ResponseEntity<ApiResponse<AttendanceRecordResponse>> markAttendance(
            @AuthenticationPrincipal User volunteerUser,
            @Valid @RequestBody MarkAttendanceRequest request
    ) {
        String volunteerId = volunteerUser != null ? volunteerUser.getStudentId() : "system";
        AttendanceRecordResponse response = attendanceService.markAttendance(request.qrToken(), volunteerId);
        return ResponseEntity.ok(ApiResponse.success("Attendance marked successfully", response));
    }
}
