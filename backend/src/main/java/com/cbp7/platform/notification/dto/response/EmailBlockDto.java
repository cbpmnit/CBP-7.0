package com.cbp7.platform.notification.dto.response;

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
) {}
