package com.cbp7.program.certificate.mapper;

import com.cbp7.program.certificate.dto.common.CertificateTemplateDto;
import com.cbp7.program.certificate.dto.response.CertificateResponse;
import com.cbp7.program.certificate.entity.Certificate;
import com.cbp7.program.certificate.entity.CertificateTemplate;
import org.springframework.stereotype.Component;

@Component
public class CertificateMapper {

    public CertificateResponse toCertificateResponse(Certificate cert) {
        if (cert == null) {
            return null;
        }

        return new CertificateResponse(
                cert.getId(),
                cert.getStudentId(),
                cert.getCertificateNumber(),
                cert.getCertificateType(),
                cert.getStatus(),
                cert.getFileUrl(),
                cert.getGeneratedAt()
        );
    }

    public CertificateTemplateDto toCertificateTemplateDto(CertificateTemplate template) {
        if (template == null) {
            return null;
        }

        return new CertificateTemplateDto(
                template.getId(),
                template.getName(),
                template.getBackgroundUrl(),
                template.getFieldConfigurationJson(),
                template.getStatus(),
                template.getCreatedAt(),
                template.getUpdatedAt()
        );
    }
}
