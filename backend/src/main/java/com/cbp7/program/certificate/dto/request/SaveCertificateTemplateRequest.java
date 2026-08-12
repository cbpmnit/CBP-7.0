package com.cbp7.program.certificate.dto.request;

import jakarta.validation.constraints.NotBlank;

public record SaveCertificateTemplateRequest(
        @NotBlank(message = "Template name is required")
        String name,

        String backgroundUrl,

        @NotBlank(message = "Field configuration is required")
        String fieldConfigurationJson,

        String status
) {}
