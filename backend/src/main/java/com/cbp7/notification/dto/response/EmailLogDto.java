package com.cbp7.notification.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

public record EmailLogDto(
        UUID id,
        UUID operationId,
        UUID templateId,
        String templateName,
        String recipient,
        String status,
        LocalDateTime sentAt,
        String errorMessage,
        LocalDateTime createdAt
) {}
