package com.cbp7.platform.notification;

import com.cbp7.platform.notification.dto.response.EmailBlockDto;
import com.cbp7.platform.notification.dto.response.EmailLogDto;
import com.cbp7.platform.notification.dto.response.EmailOperationDto;
import com.cbp7.platform.notification.dto.response.NotificationTemplateResponse;
import com.cbp7.platform.notification.entity.EmailBlock;
import com.cbp7.platform.notification.entity.EmailLog;
import com.cbp7.platform.notification.entity.EmailOperation;
import com.cbp7.platform.notification.entity.NotificationChannel;
import com.cbp7.platform.notification.entity.NotificationTemplate;
import com.cbp7.platform.notification.entity.NotificationType;
import org.springframework.stereotype.Component;

@Component
public class NotificationMapper {

    public NotificationTemplateResponse toTemplateResponse(NotificationTemplate template) {
        if (template == null) {
            return null;
        }

        String eventTypeStr = template.getEventType() != null ? template.getEventType()
                : (template.getType() != null ? template.getType().name() : "ATTENDANCE_QR_GENERATED");

        return new NotificationTemplateResponse(
                template.getId(),
                template.getName(),
                template.getName(),
                template.getChannel() != null ? template.getChannel() : NotificationChannel.EMAIL,
                template.getType() != null ? template.getType() : NotificationType.ATTENDANCE_QR_GENERATED,
                eventTypeStr,
                eventTypeStr,
                template.getSubject(),
                template.getContent(),
                template.getContent(),
                template.getVariables(),
                template.getDesignJson(),
                template.getStatus() != null ? template.getStatus() : "DRAFT",
                template.getPublishedAt(),
                template.getCreatedBy(),
                template.getCreatedAt(),
                template.getUpdatedAt()
        );
    }

    public EmailBlockDto toEmailBlockDto(EmailBlock block) {
        if (block == null) {
            return null;
        }

        return new EmailBlockDto(
                block.getId(),
                block.getName(),
                block.getCategory(),
                block.getContent(),
                block.getHtmlSnippet(),
                block.getEnabled(),
                block.getCreatedAt(),
                block.getUpdatedAt()
        );
    }

    public EmailOperationDto toOperationDto(EmailOperation op) {
        if (op == null) {
            return null;
        }

        return new EmailOperationDto(
                op.getId(),
                op.getName(),
                op.getTemplateId(),
                op.getRecipientType(),
                op.getFilters(),
                op.getStatus(),
                op.getTriggerType(),
                op.getTotalRecipients(),
                op.getSentCount(),
                op.getFailedCount(),
                op.getScheduledAt(),
                op.getExecutedAt(),
                op.getCreatedBy(),
                op.getCreatedAt(),
                op.getUpdatedAt()
        );
    }

    public EmailLogDto toEmailLogDto(EmailLog log) {
        if (log == null) {
            return null;
        }

        return new EmailLogDto(
                log.getId(),
                log.getOperationId(),
                log.getTemplateId(),
                log.getTemplateName(),
                log.getRecipient(),
                log.getStatus(),
                log.getSentAt(),
                log.getErrorMessage(),
                log.getCreatedAt()
        );
    }
}
