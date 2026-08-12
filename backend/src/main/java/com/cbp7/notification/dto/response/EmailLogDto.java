package com.cbp7.notification.dto.response;

import com.cbp7.notification.entity.EmailLog;
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
) {
    public static EmailLogDto fromEntity(EmailLog entity) {
        return new EmailLogDto(
                entity.getId(),
                entity.getOperationId(),
                entity.getTemplateId(),
                entity.getTemplateName(),
                entity.getRecipient(),
                entity.getStatus(),
                entity.getSentAt(),
                entity.getErrorMessage(),
                entity.getCreatedAt()
        );
    }
}
