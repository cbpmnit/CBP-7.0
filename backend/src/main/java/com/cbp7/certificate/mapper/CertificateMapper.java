package com.cbp7.certificate.mapper;

import com.cbp7.certificate.dto.common.CertificateTemplateDto;
import com.cbp7.certificate.dto.response.CertificateResponse;
import com.cbp7.certificate.entity.Certificate;
import com.cbp7.certificate.entity.CertificateTemplate;
import org.springframework.stereotype.Component;

@Component
public class CertificateMapper {

    public CertificateResponse toCertificateResponse(Certificate cert) {
        if (cert == null) {
            return null;
        }

        return CertificateResponse.fromEntity(cert);
    }

    public CertificateTemplateDto toCertificateTemplateDto(CertificateTemplate template) {
        if (template == null) {
            return null;
        }

        return CertificateTemplateDto.fromEntity(template);
    }
}
