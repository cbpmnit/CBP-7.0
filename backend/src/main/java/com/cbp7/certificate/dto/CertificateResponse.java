package com.cbp7.certificate.dto;

import com.cbp7.certificate.entity.Certificate;
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
) {
    public static CertificateResponse fromEntity(Certificate cert) {
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
}
