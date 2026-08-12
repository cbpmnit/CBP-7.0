package com.cbp7.program.attendance.record.controller;

import com.cbp7.program.attendance.record.dto.response.StudentAttendanceSummaryResponse;
import com.cbp7.program.attendance.record.service.AttendanceQueryService;
import com.cbp7.identity.auth.entity.User;
import com.cbp7.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/student/attendance")
@RequiredArgsConstructor
public class StudentAttendanceRecordController {

    private final AttendanceQueryService attendanceQueryService;

    @GetMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<StudentAttendanceSummaryResponse>> getMyAttendanceHistory(
            @AuthenticationPrincipal User currentUser
    ) {
        String studentId = currentUser.getStudentId();
        StudentAttendanceSummaryResponse response = attendanceQueryService.getStudentAttendanceSummary(studentId);
        return ResponseEntity.ok(ApiResponse.success("Student attendance summary retrieved successfully", response));
    }
}
