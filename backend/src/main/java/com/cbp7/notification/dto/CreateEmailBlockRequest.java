package com.cbp7.notification.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateEmailBlockRequest(
        @NotBlank(message = "Block name is required")
        String name,

        String category,

        String content,

        @NotBlank(message = "HTML snippet is required")
        String htmlSnippet,

        Boolean enabled
) {
}
