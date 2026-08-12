package com.cbp7.platform.notification.dto.request;

import jakarta.validation.constraints.NotNull;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public record SendTestEmailRequest(
        @NotNull(message = "Template ID is required")
        UUID templateId,

        String recipientEmail,

        List<String> recipients,

        Map<String, String> sampleData,

        Boolean sendToAll
) {}
