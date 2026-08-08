package com.cbp7.admin.student.controller;

import com.cbp7.admin.student.dto.*;
import com.cbp7.admin.student.service.AdminStudentManagementService;
import com.cbp7.auth.entity.User;
import com.cbp7.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminStudentManagementController {

    private final AdminStudentManagementService studentManagementService;

    @GetMapping("/students")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<AdminStudentListItemResponse>>> getStudents(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String registrationStatus,
            @RequestParam(required = false) String paymentStatus,
            @RequestParam(required = false) String attendanceStatus,
            @RequestParam(required = false) String profileStatus,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        Page<AdminStudentListItemResponse> response = studentManagementService.getStudentsPaginated(
                search, registrationStatus, paymentStatus, attendanceStatus, profileStatus, pageable
        );
        return ResponseEntity.ok(ApiResponse.success("Student directory retrieved successfully", response));
    }

    @GetMapping("/students/{studentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AdminFullStudentDetailResponse>> getStudentById(
            @PathVariable String studentId
    ) {
        AdminFullStudentDetailResponse response = studentManagementService.getStudentFullDetail(studentId);
        return ResponseEntity.ok(ApiResponse.success("Complete student profile retrieved successfully", response));
    }

    @PutMapping("/students/{studentId}/profile")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AdminFullStudentDetailResponse>> updateStudentProfile(
            @PathVariable String studentId,
            @Valid @RequestBody UpdateStudentProfileRequest request
    ) {
        AdminFullStudentDetailResponse response = studentManagementService.updateStudentProfile(studentId, request);
        return ResponseEntity.ok(ApiResponse.success("Student profile updated successfully", response));
    }

    @GetMapping("/students/{studentId}/profile/pdf")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> downloadStudentPdf(@PathVariable String studentId) {
        byte[] pdfBytes = studentManagementService.generateStudentPdf(studentId);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=Student_Profile_" + studentId + ".pdf")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdfBytes);
    }

    @GetMapping("/students/export")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> exportStudentsCsv(
            @RequestParam(required = false) String paymentStatus,
            @RequestParam(required = false) String registrationStatus,
            @RequestParam(required = false) String search
    ) {
        byte[] csvBytes = studentManagementService.exportStudentsCsv(paymentStatus, registrationStatus, search);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=CBP7_Students_Export.csv")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csvBytes);
    }

    @GetMapping("/dashboard/summary-stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AdminDashboardStatsResponse>> getDashboardStats() {
        AdminDashboardStatsResponse response = studentManagementService.getDashboardSummary();
        return ResponseEntity.ok(ApiResponse.success("Dashboard stats summary retrieved successfully", response));
    }

    @GetMapping("/preferences")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AdminPreferencesDto>> getAdminPreferences(
            @AuthenticationPrincipal User adminUser
    ) {
        String adminId = adminUser != null ? adminUser.getStudentId() : "admin";
        AdminPreferencesDto response = studentManagementService.getAdminPreferences(adminId);
        return ResponseEntity.ok(ApiResponse.success("Admin UI preferences retrieved successfully", response));
    }

    @PostMapping("/preferences")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AdminPreferencesDto>> saveAdminPreferences(
            @AuthenticationPrincipal User adminUser,
            @RequestBody AdminPreferencesDto dto
    ) {
        String adminId = adminUser != null ? adminUser.getStudentId() : "admin";
        AdminPreferencesDto response = studentManagementService.saveAdminPreferences(adminId, dto);
        return ResponseEntity.ok(ApiResponse.success("Admin UI preferences saved successfully", response));
    }
}
