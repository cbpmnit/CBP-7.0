package com.cbp7.notification.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public record CreateEmailOperationRequest(
        @NotBlank(message = "Operation name is required")
        String name,

        @NotNull(message = "Template ID is required")
        UUID templateId,

        @NotBlank(message = "Recipient type is required")
        String recipientType, // PAID_STUDENTS, ALL_STUDENTS, CUSTOM_FILTER, INDIVIDUAL

        String filters, // JSON string or branch / status filters

        List<String> individualRecipients,

        String triggerType, // MANUAL, EVENT_TRIGGER, SCHEDULED

        LocalDateTime scheduledAt,

        Map<String, String> sampleData
) {
}
