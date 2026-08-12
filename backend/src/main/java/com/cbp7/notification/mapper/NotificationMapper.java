package com.cbp7.notification.mapper;

import com.cbp7.notification.dto.response.EmailBlockDto;
import com.cbp7.notification.dto.response.EmailLogDto;
import com.cbp7.notification.dto.response.EmailOperationDto;
import com.cbp7.notification.dto.response.NotificationTemplateResponse;
import com.cbp7.notification.entity.EmailBlock;
import com.cbp7.notification.entity.EmailLog;
import com.cbp7.notification.entity.EmailOperation;
import com.cbp7.notification.entity.NotificationTemplate;
import org.springframework.stereotype.Component;

@Component
public class NotificationMapper {

    public NotificationTemplateResponse toTemplateResponse(NotificationTemplate template) {
        if (template == null) {
            return null;
        }
        return NotificationTemplateResponse.fromEntity(template);
    }

    public EmailBlockDto toEmailBlockDto(EmailBlock block) {
        if (block == null) {
            return null;
        }
        return EmailBlockDto.fromEntity(block);
    }

    public EmailOperationDto toOperationDto(EmailOperation op) {
        if (op == null) {
            return null;
        }
        return EmailOperationDto.fromEntity(op);
    }

    public EmailLogDto toEmailLogDto(EmailLog log) {
        if (log == null) {
            return null;
        }
        return EmailLogDto.fromEntity(log);
    }
}
