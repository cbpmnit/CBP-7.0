package com.cbp7.platform.notification.dto.response;

import java.util.List;

public record NotificationTemplateStatsResponse(
        long totalTemplates,
        long activeTemplates,
        long draftTemplates,
        long publishedTemplates,
        long archivedTemplates,
        long failedDeliveriesCount,
        List<String> missingActiveEventTypes
) {
}
