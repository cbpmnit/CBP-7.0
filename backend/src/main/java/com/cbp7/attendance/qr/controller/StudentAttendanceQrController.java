package com.cbp7.attendance.qr.controller;

import com.cbp7.attendance.qr.dto.AttendanceQrResponse;
import com.cbp7.attendance.qr.service.AttendanceQrService;
import com.cbp7.auth.entity.User;
import com.cbp7.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/student/attendance/qr")
@RequiredArgsConstructor
public class StudentAttendanceQrController {

    private final AttendanceQrService attendanceQrService;

    @GetMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<AttendanceQrResponse>> getMyAttendanceQr(@AuthenticationPrincipal User currentUser) {
        String studentId = currentUser.getStudentId();
        AttendanceQrResponse response = attendanceQrService.getStudentQr(studentId);
        return ResponseEntity.ok(ApiResponse.success("Attendance QR code retrieved successfully", response));
    }
}
