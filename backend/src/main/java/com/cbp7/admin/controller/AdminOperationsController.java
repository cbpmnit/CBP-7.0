package com.cbp7.admin.controller;

import com.cbp7.admin.dto.response.AdminOperationsOverviewResponse;
import com.cbp7.admin.service.AdminOperationsService;
import com.cbp7.certificate.dto.response.CertificateResponse;
import com.cbp7.certificate.service.CertificateService;
import com.cbp7.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping({"/api/v1/admin/operations", "/api/admin/operations"})
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminOperationsController {

    private final AdminOperationsService adminOperationsService;
    private final CertificateService certificateService;

    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<AdminOperationsOverviewResponse>> getOverview() {
        AdminOperationsOverviewResponse response = adminOperationsService.getOverview();
        return ResponseEntity.ok(ApiResponse.success("Operations overview retrieved successfully", response));
    }

    @PostMapping("/certificates/generate-all")
    public ResponseEntity<ApiResponse<List<CertificateResponse>>> generateAllCertificates() {
        List<CertificateResponse> response = certificateService.generateAllEligibleCertificates();
        return ResponseEntity.ok(ApiResponse.success("Eligible certificates generated successfully", response));
    }

    @PostMapping("/certificates/publish-all")
    public ResponseEntity<ApiResponse<List<CertificateResponse>>> publishAllCertificates() {
        List<CertificateResponse> response = certificateService.publishAllCertificates();
        return ResponseEntity.ok(ApiResponse.success("Certificates published successfully", response));
    }
}
