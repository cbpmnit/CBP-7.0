package com.cbp7.notification.dto;

import com.cbp7.notification.entity.EmailOperation;
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
) {
    public static EmailOperationDto fromEntity(EmailOperation entity) {
        return new EmailOperationDto(
                entity.getId(),
                entity.getName(),
                entity.getTemplateId(),
                entity.getRecipientType(),
                entity.getFilters(),
                entity.getStatus(),
                entity.getTriggerType(),
                entity.getTotalRecipients(),
                entity.getSentCount(),
                entity.getFailedCount(),
                entity.getScheduledAt(),
                entity.getExecutedAt(),
                entity.getCreatedBy(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}
