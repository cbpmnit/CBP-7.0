package com.cbp7.certificate.controller;

import com.cbp7.auth.entity.User;
import com.cbp7.certificate.dto.response.CertificateResponse;
import com.cbp7.certificate.entity.CertificateStatus;
import com.cbp7.certificate.service.CertificateService;
import com.cbp7.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/student/certificate")
@RequiredArgsConstructor
public class StudentCertificateController {

    private final CertificateService certificateService;

    @GetMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<CertificateResponse>> getMyCertificate(@AuthenticationPrincipal User currentUser) {
        String studentId = currentUser.getStudentId();
        CertificateResponse response = certificateService.getStudentCertificate(studentId);
        if (response.status() != CertificateStatus.PUBLISHED) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("Certificate has not been published yet by administrators."));
        }
        return ResponseEntity.ok(ApiResponse.success("Certificate retrieved successfully", response));
    }

    @GetMapping("/download")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<byte[]> downloadMyCertificate(@AuthenticationPrincipal User currentUser) {
        String studentId = currentUser.getStudentId();
        CertificateResponse response = certificateService.getStudentCertificate(studentId);
        if (response.status() != CertificateStatus.PUBLISHED) {
            throw new IllegalStateException("Certificate has not been published yet.");
        }
        byte[] pdfBytes = certificateService.getStudentCertificatePdfBytes(studentId);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"certificate_" + studentId + ".pdf\"")
                .body(pdfBytes);
    }
}
