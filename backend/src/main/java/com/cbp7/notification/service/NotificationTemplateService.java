package com.cbp7.notification.service;

import com.cbp7.common.exception.ResourceNotFoundException;
import com.cbp7.notification.dto.CreateNotificationTemplateRequest;
import com.cbp7.notification.dto.NotificationTemplateResponse;
import com.cbp7.notification.dto.UpdateNotificationTemplateRequest;
import com.cbp7.notification.entity.NotificationTemplate;
import com.cbp7.notification.repository.NotificationTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class NotificationTemplateService {

    private final NotificationTemplateRepository notificationTemplateRepository;

    @Transactional
    public NotificationTemplateResponse createTemplate(CreateNotificationTemplateRequest request, String adminStudentId) {
        NotificationTemplate template = NotificationTemplate.builder()
                .name(request.name())
                .channel(request.channel())
                .type(request.type())
                .subject(request.subject())
                .content(request.content())
                .variables(request.variables())
                .createdBy(adminStudentId)
                .build();

        NotificationTemplate saved = notificationTemplateRepository.save(template);
        return NotificationTemplateResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<NotificationTemplateResponse> getAllTemplates() {
        return notificationTemplateRepository.findAll()
                .stream()
                .map(NotificationTemplateResponse::fromEntity)
                .toList();
    }

    @Transactional(readOnly = true)
    public NotificationTemplateResponse getTemplateById(UUID id) {
        NotificationTemplate template = notificationTemplateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification template not found with id: " + id));
        return NotificationTemplateResponse.fromEntity(template);
    }

    @Transactional
    public NotificationTemplateResponse updateTemplate(UUID id, UpdateNotificationTemplateRequest request) {
        NotificationTemplate template = notificationTemplateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification template not found with id: " + id));

        template.setName(request.name());
        template.setChannel(request.channel());
        template.setType(request.type());
        template.setSubject(request.subject());
        template.setContent(request.content());
        template.setVariables(request.variables());

        NotificationTemplate updated = notificationTemplateRepository.save(template);
        return NotificationTemplateResponse.fromEntity(updated);
    }

    @Transactional
    public void deleteTemplate(UUID id) {
        NotificationTemplate template = notificationTemplateRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification template not found with id: " + id));
        notificationTemplateRepository.delete(template);
    }
}
