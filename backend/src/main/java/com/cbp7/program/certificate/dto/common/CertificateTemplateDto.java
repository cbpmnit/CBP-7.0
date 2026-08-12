package com.cbp7.program.certificate.dto.common;

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
) {}
