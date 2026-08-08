package com.cbp7.admin.controller;

import com.cbp7.admin.dto.AdminDashboardSummaryResponse;
import com.cbp7.admin.dto.AdminPaymentOverviewResponse;
import com.cbp7.admin.dto.AdminStudentDetailResponse;
import com.cbp7.admin.service.AdminDashboardService;
import com.cbp7.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    @GetMapping("/dashboard/summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'VOLUNTEER')")
    public ResponseEntity<ApiResponse<AdminDashboardSummaryResponse>> getDashboardSummary() {
        AdminDashboardSummaryResponse response = adminDashboardService.getSummary();
        return ResponseEntity.ok(ApiResponse.success("Admin dashboard summary retrieved successfully", response));
    }

    @GetMapping("/students")
    @PreAuthorize("hasAnyRole('ADMIN', 'VOLUNTEER')")
    public ResponseEntity<ApiResponse<List<AdminStudentDetailResponse>>> searchStudents(
            @RequestParam(required = false) String search
    ) {
        List<AdminStudentDetailResponse> response = adminDashboardService.searchStudents(search);
        return ResponseEntity.ok(ApiResponse.success("Student directory retrieved successfully", response));
    }

    @GetMapping("/payments")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AdminPaymentOverviewResponse>> getPaymentOverview() {
        AdminPaymentOverviewResponse response = adminDashboardService.getPaymentOverview();
        return ResponseEntity.ok(ApiResponse.success("Payment overview retrieved successfully", response));
    }
}
