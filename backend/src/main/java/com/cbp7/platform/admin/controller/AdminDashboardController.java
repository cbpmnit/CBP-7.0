package com.cbp7.platform.admin.controller;

import com.cbp7.platform.admin.dto.response.AdminDashboardSummaryResponse;
import com.cbp7.platform.admin.dto.response.AdminPaymentOverviewResponse;
import com.cbp7.platform.admin.service.AdminDashboardService;
import com.cbp7.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/api/v1/admin", "/api/admin"})
@RequiredArgsConstructor
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    @GetMapping("/dashboard/summary")
    @PreAuthorize("hasRole('ADMIN') or hasRole('VOLUNTEER')")
    public ResponseEntity<ApiResponse<AdminDashboardSummaryResponse>> getDashboardSummary() {
        AdminDashboardSummaryResponse response = adminDashboardService.getSummary();
        return ResponseEntity.ok(ApiResponse.success("Admin dashboard summary retrieved successfully", response));
    }

    @GetMapping("/payments")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('PAYMENT_VIEW')")
    public ResponseEntity<ApiResponse<AdminPaymentOverviewResponse>> getPaymentOverview() {
        AdminPaymentOverviewResponse response = adminDashboardService.getPaymentOverview();
        return ResponseEntity.ok(ApiResponse.success("Payment overview retrieved successfully", response));
    }

    @GetMapping({"/payments/export", "/payment/export"})
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('PAYMENT_VIEW')")
    public ResponseEntity<byte[]> exportPaymentsCsv(
            @org.springframework.web.bind.annotation.RequestParam(required = false) String search,
            @org.springframework.web.bind.annotation.RequestParam(required = false) String paymentStatus
    ) {
        byte[] csvBytes = adminDashboardService.exportPaymentsCsv(search, paymentStatus);
        String filename = "cbp-payments-" + java.time.LocalDate.now() + ".csv";
        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(org.springframework.http.MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(csvBytes);
    }
}
