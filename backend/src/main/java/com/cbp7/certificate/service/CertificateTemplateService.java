package com.cbp7.certificate.service;

import com.cbp7.certificate.dto.common.CertificateTemplateDto;
import com.cbp7.certificate.dto.request.SaveCertificateTemplateRequest;

import java.util.List;
import java.util.UUID;

public interface CertificateTemplateService {
    CertificateTemplateDto getActivePublishedTemplate();
    List<CertificateTemplateDto> getAllTemplates();
    CertificateTemplateDto getTemplateById(UUID id);
    CertificateTemplateDto saveTemplate(UUID id, SaveCertificateTemplateRequest request);
    CertificateTemplateDto publishTemplate(UUID id);
}
