package com.cbp7.notification.dto.common;

public record EmailVariableDto(
        String key,
        String label,
        String category,
        String description,
        String exampleValue,
        String dataType
) {}
