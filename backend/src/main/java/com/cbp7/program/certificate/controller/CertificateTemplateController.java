package com.cbp7.program.certificate.controller;

import com.cbp7.program.certificate.dto.common.CertificateTemplateDto;
import com.cbp7.program.certificate.dto.request.SaveCertificateTemplateRequest;
import com.cbp7.program.certificate.service.CertificateTemplateService;
import com.cbp7.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping({"/api/v1/admin/certificate-templates", "/api/admin/certificate-templates"})
@RequiredArgsConstructor
public class CertificateTemplateController {

    private final CertificateTemplateService certificateTemplateService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('CERTIFICATE_GENERATE')")
    public ResponseEntity<ApiResponse<List<CertificateTemplateDto>>> getAllTemplates() {
        List<CertificateTemplateDto> list = certificateTemplateService.getAllTemplates();
        return ResponseEntity.ok(ApiResponse.success("Certificate templates retrieved", list));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<CertificateTemplateDto>> getActivePublishedTemplate() {
        CertificateTemplateDto template = certificateTemplateService.getActivePublishedTemplate();
        return ResponseEntity.ok(ApiResponse.success("Active published certificate template retrieved", template));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('CERTIFICATE_GENERATE')")
    public ResponseEntity<ApiResponse<CertificateTemplateDto>> getTemplateById(@PathVariable UUID id) {
        CertificateTemplateDto template = certificateTemplateService.getTemplateById(id);
        return ResponseEntity.ok(ApiResponse.success("Certificate template retrieved", template));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('CERTIFICATE_GENERATE')")
    public ResponseEntity<ApiResponse<CertificateTemplateDto>> createTemplate(
            @Valid @RequestBody SaveCertificateTemplateRequest request
    ) {
        CertificateTemplateDto saved = certificateTemplateService.saveTemplate(null, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Certificate template saved successfully", saved));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('CERTIFICATE_GENERATE')")
    public ResponseEntity<ApiResponse<CertificateTemplateDto>> updateTemplate(
            @PathVariable UUID id,
            @Valid @RequestBody SaveCertificateTemplateRequest request
    ) {
        CertificateTemplateDto updated = certificateTemplateService.saveTemplate(id, request);
        return ResponseEntity.ok(ApiResponse.success("Certificate template updated successfully", updated));
    }

    @PostMapping("/{id}/publish")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('CERTIFICATE_GENERATE')")
    public ResponseEntity<ApiResponse<CertificateTemplateDto>> publishTemplate(@PathVariable UUID id) {
        CertificateTemplateDto published = certificateTemplateService.publishTemplate(id);
        return ResponseEntity.ok(ApiResponse.success("Certificate template published live", published));
    }
}
