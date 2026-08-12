package com.cbp7.platform.notification.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

public record EmailOperationDto(
        UUID id,
        String name,
        UUID templateId,
        String recipientType,
        String filters,
        String status,
        String triggerType,
        Integer totalRecipients,
        Integer sentCount,
        Integer failedCount,
        LocalDateTime scheduledAt,
        LocalDateTime executedAt,
        String createdBy,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
