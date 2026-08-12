package com.cbp7.certificate.dto.response;

import com.cbp7.certificate.entity.CertificateStatus;
import com.cbp7.certificate.entity.CertificateType;

import java.time.LocalDateTime;
import java.util.UUID;

public record CertificateResponse(
        UUID id,
        String studentId,
        String certificateNumber,
        CertificateType certificateType,
        CertificateStatus status,
        String downloadUrl,
        LocalDateTime generatedAt
) {}
