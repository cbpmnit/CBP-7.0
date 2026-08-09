package com.cbp7.attendance.record.controller;

import com.cbp7.attendance.record.dto.AdminAttendanceSummaryResponse;
import com.cbp7.attendance.record.dto.DailyAttendanceReportResponse;
import com.cbp7.attendance.record.dto.StudentAttendanceSummaryResponse;
import com.cbp7.attendance.record.service.AttendanceQueryService;
import com.cbp7.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping({"/api/v1/admin/attendance", "/api/admin/attendance"})
@RequiredArgsConstructor
public class AdminAttendanceRecordController {

    private final AttendanceQueryService attendanceQueryService;

    @GetMapping("/date/{date}")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('ATTENDANCE_VIEW')")
    public ResponseEntity<ApiResponse<DailyAttendanceReportResponse>> getAttendanceForDate(
            @PathVariable @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        DailyAttendanceReportResponse response = attendanceQueryService.getAttendanceByDate(date);
        return ResponseEntity.ok(ApiResponse.success("Daily attendance report retrieved successfully", response));
    }

    @GetMapping("/student/{studentId}")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('ATTENDANCE_VIEW')")
    public ResponseEntity<ApiResponse<StudentAttendanceSummaryResponse>> getStudentAttendanceHistory(
            @PathVariable String studentId
    ) {
        StudentAttendanceSummaryResponse response = attendanceQueryService.getStudentAttendanceSummary(studentId);
        return ResponseEntity.ok(ApiResponse.success("Student attendance summary retrieved successfully", response));
    }

    @GetMapping("/student/{studentId}/profile")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('ATTENDANCE_VIEW')")
    public ResponseEntity<ApiResponse<com.cbp7.attendance.record.dto.StudentAttendanceProfileResponse>> getStudentAttendanceProfile(
            @PathVariable String studentId
    ) {
        com.cbp7.attendance.record.dto.StudentAttendanceProfileResponse response = attendanceQueryService.getStudentAttendanceProfile(studentId);
        return ResponseEntity.ok(ApiResponse.success("Student attendance profile retrieved successfully", response));
    }

    @GetMapping("/user/{userId}/profile")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('ATTENDANCE_VIEW')")
    public ResponseEntity<ApiResponse<com.cbp7.attendance.record.dto.UserAttendanceProfileResponse>> getUserAttendanceProfile(
            @PathVariable String userId
    ) {
        com.cbp7.attendance.record.dto.UserAttendanceProfileResponse response = attendanceQueryService.getUserAttendanceProfile(userId);
        return ResponseEntity.ok(ApiResponse.success("User attendance profile retrieved successfully", response));
    }

    @GetMapping("/summary")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('ATTENDANCE_VIEW')")
    public ResponseEntity<ApiResponse<AdminAttendanceSummaryResponse>> getAdminAttendanceSummary() {
        AdminAttendanceSummaryResponse response = attendanceQueryService.getAdminAttendanceSummary();
        return ResponseEntity.ok(ApiResponse.success("Admin attendance summary retrieved successfully", response));
    }

    @GetMapping("/export")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('ATTENDANCE_VIEW')")
    public ResponseEntity<byte[]> exportAttendanceCsv(
            @org.springframework.web.bind.annotation.RequestParam(required = false) String search,
            @org.springframework.web.bind.annotation.RequestParam(required = false) java.util.UUID sessionId,
            @org.springframework.web.bind.annotation.RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        byte[] csvBytes = attendanceQueryService.exportAttendanceCsv(search, sessionId, date);
        String filename = "cbp-attendance-" + java.time.LocalDate.now() + ".csv";
        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(org.springframework.http.MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(csvBytes);
    }
}
