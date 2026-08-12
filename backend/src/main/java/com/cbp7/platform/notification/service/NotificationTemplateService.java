package com.cbp7.platform.notification.service;

import com.cbp7.platform.notification.dto.common.EmailVariableDto;
import com.cbp7.platform.notification.dto.request.CreateNotificationTemplateRequest;
import com.cbp7.platform.notification.dto.request.UpdateNotificationTemplateRequest;
import com.cbp7.platform.notification.dto.response.NotificationTemplateResponse;
import com.cbp7.platform.notification.dto.response.NotificationTemplateStatsResponse;

import java.util.List;
import java.util.UUID;

public interface NotificationTemplateService {
    NotificationTemplateResponse createTemplate(CreateNotificationTemplateRequest request, String adminStudentId);
    List<NotificationTemplateResponse> getAllTemplates();
    NotificationTemplateResponse getTemplateById(UUID id);
    NotificationTemplateResponse updateTemplate(UUID id, UpdateNotificationTemplateRequest request);
    NotificationTemplateResponse publishTemplate(UUID id);
    NotificationTemplateResponse activateTemplate(UUID id);
    NotificationTemplateResponse deactivateTemplate(UUID id);
    NotificationTemplateResponse archiveTemplate(UUID id);
    NotificationTemplateResponse duplicateTemplate(UUID id, String adminStudentId);
    void deleteTemplate(UUID id);
    List<EmailVariableDto> getVariablesRegistry();
    List<String> getMissingActiveEventTypes();
    NotificationTemplateStatsResponse getTemplateStats();
}
