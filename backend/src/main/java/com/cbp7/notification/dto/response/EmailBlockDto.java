package com.cbp7.notification.dto.response;

import com.cbp7.notification.entity.EmailBlock;
import java.time.LocalDateTime;
import java.util.UUID;

public record EmailBlockDto(
        UUID id,
        String name,
        String category,
        String content,
        String htmlSnippet,
        Boolean enabled,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public static EmailBlockDto fromEntity(EmailBlock entity) {
        return new EmailBlockDto(
                entity.getId(),
                entity.getName(),
                entity.getCategory(),
                entity.getContent(),
                entity.getHtmlSnippet(),
                entity.getEnabled(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }
}
