package com.cbp7.certificate.dto;

import com.cbp7.certificate.entity.CertificateTemplate;
import java.time.LocalDateTime;
import java.util.UUID;

public record CertificateTemplateDto(
        UUID id,
        String name,
        String backgroundUrl,
        String fieldConfigurationJson,
        String status,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static CertificateTemplateDto fromEntity(CertificateTemplate entity) {
        return new CertificateTemplateDto(
                entity.getId(),
                entity.getName(),
                entity.getBackgroundUrl(),
                entity.getFieldConfigurationJson(),
                entity.getStatus(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}
