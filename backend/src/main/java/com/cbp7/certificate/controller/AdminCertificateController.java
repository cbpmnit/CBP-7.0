package com.cbp7.certificate.controller;

import com.cbp7.certificate.dto.CertificateResponse;
import com.cbp7.certificate.service.CertificateService;
import com.cbp7.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/certificates")
@RequiredArgsConstructor
public class AdminCertificateController {

    private final CertificateService certificateService;

    @PostMapping("/generate/{studentId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CertificateResponse>> generateCertificate(@PathVariable String studentId) {
        CertificateResponse response = certificateService.generateCertificateForStudent(studentId);
        return ResponseEntity.ok(ApiResponse.success("Certificate generated successfully", response));
    }

    @PostMapping("/generate-all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<CertificateResponse>>> generateAllCertificates() {
        List<CertificateResponse> response = certificateService.generateAllEligibleCertificates();
        return ResponseEntity.ok(ApiResponse.success("Eligible certificates generated successfully", response));
    }
}
