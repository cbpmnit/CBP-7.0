package com.cbp7.notification.dto;

public record EmailVariableDto(
        String key,
        String label,
        String category,
        String description,
        String exampleValue,
        String dataType
) {
}
