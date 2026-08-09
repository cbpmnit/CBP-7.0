package com.cbp7.notification.controller;

import com.cbp7.auth.entity.User;
import com.cbp7.common.response.ApiResponse;
import com.cbp7.notification.dto.CreateNotificationTemplateRequest;
import com.cbp7.notification.dto.NotificationTemplateResponse;
import com.cbp7.notification.dto.UpdateNotificationTemplateRequest;
import com.cbp7.notification.service.NotificationTemplateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/notifications/templates")
@RequiredArgsConstructor
public class NotificationTemplateController {

    private final NotificationTemplateService notificationTemplateService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<NotificationTemplateResponse>> createTemplate(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody CreateNotificationTemplateRequest request
    ) {
        String adminStudentId = currentUser != null ? currentUser.getStudentId() : "system";
        NotificationTemplateResponse response = notificationTemplateService.createTemplate(request, adminStudentId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Notification template created successfully", response));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('EMAIL_SEND')")
    public ResponseEntity<ApiResponse<List<NotificationTemplateResponse>>> getAllTemplates() {
        List<NotificationTemplateResponse> response = notificationTemplateService.getAllTemplates();
        return ResponseEntity.ok(ApiResponse.success("Notification templates retrieved successfully", response));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('EMAIL_SEND')")
    public ResponseEntity<ApiResponse<NotificationTemplateResponse>> getTemplateById(@PathVariable UUID id) {
        NotificationTemplateResponse response = notificationTemplateService.getTemplateById(id);
        return ResponseEntity.ok(ApiResponse.success("Notification template retrieved successfully", response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<NotificationTemplateResponse>> updateTemplate(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateNotificationTemplateRequest request
    ) {
        NotificationTemplateResponse response = notificationTemplateService.updateTemplate(id, request);
        return ResponseEntity.ok(ApiResponse.success("Notification template updated successfully", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteTemplate(@PathVariable UUID id) {
        notificationTemplateService.deleteTemplate(id);
        return ResponseEntity.noContent().build();
    }
}
