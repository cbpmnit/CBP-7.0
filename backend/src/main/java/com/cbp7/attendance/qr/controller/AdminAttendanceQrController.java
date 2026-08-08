package com.cbp7.attendance.qr.controller;

import com.cbp7.attendance.qr.dto.AttendanceQrResponse;
import com.cbp7.attendance.qr.entity.AttendanceQrCode;
import com.cbp7.attendance.qr.service.AttendanceQrService;
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

@RestController
@RequestMapping("/api/v1/admin/attendance/qr")
@RequiredArgsConstructor
public class AdminAttendanceQrController {

    private final AttendanceQrService attendanceQrService;

    @PostMapping("/generate/{studentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AttendanceQrResponse>> generateStudentQr(@PathVariable String studentId) {
        AttendanceQrCode qrCode = attendanceQrService.generateQrForStudent(studentId);
        AttendanceQrResponse response = attendanceQrService.getStudentQr(studentId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Attendance QR code generated successfully", response));
    }

    @GetMapping("/{studentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AttendanceQrResponse>> getStudentQr(@PathVariable String studentId) {
        AttendanceQrResponse response = attendanceQrService.getStudentQr(studentId);
        return ResponseEntity.ok(ApiResponse.success("Attendance QR code retrieved successfully", response));
    }
}
