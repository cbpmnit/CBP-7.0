package com.cbp7.notification.controller;

import com.cbp7.admin.student.dto.response.AdminStudentListItemResponse;
import com.cbp7.admin.student.service.AdminStudentManagementService;
import com.cbp7.auth.entity.User;
import com.cbp7.common.response.ApiResponse;
import com.cbp7.notification.dto.common.EmailVariableDto;
import com.cbp7.notification.dto.request.CreateNotificationTemplateRequest;
import com.cbp7.notification.dto.request.SendTestEmailRequest;
import com.cbp7.notification.dto.request.UpdateNotificationTemplateRequest;
import com.cbp7.notification.dto.response.NotificationTemplateResponse;
import com.cbp7.notification.service.EmailNotificationService;
import com.cbp7.notification.service.NotificationTemplateService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping({"/api/v1/admin/email-templates", "/api/v1/admin/notifications/templates", "/api/v1/admin/email"})
@RequiredArgsConstructor
public class NotificationTemplateController {

    private final NotificationTemplateService notificationTemplateService;
    private final EmailNotificationService emailNotificationService;
    private final AdminStudentManagementService studentManagementService;

    @PostMapping({"", "/templates"})
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('EMAIL_SEND')")
    public ResponseEntity<ApiResponse<NotificationTemplateResponse>> createTemplate(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody CreateNotificationTemplateRequest request
    ) {
        String adminStudentId = currentUser != null ? currentUser.getStudentId() : "system";
        NotificationTemplateResponse response = notificationTemplateService.createTemplate(request, adminStudentId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Email template created as draft successfully", response));
    }

    @GetMapping({"", "/templates"})
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('EMAIL_SEND')")
    public ResponseEntity<ApiResponse<List<NotificationTemplateResponse>>> getAllTemplates() {
        List<NotificationTemplateResponse> response = notificationTemplateService.getAllTemplates();
        return ResponseEntity.ok(ApiResponse.success("Email templates retrieved successfully", response));
    }

    @GetMapping({"/eligible-students", "/templates/eligible-students"})
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('EMAIL_SEND')")
    public ResponseEntity<ApiResponse<Page<AdminStudentListItemResponse>>> getEligiblePaidStudents(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String search,
            @PageableDefault(size = 20) Pageable pageable
    ) {
        String effectiveQuery = query != null && !query.isBlank() ? query : search;
        // Backend strictly enforces paymentStatus = "SUCCESS"
        Page<AdminStudentListItemResponse> page = studentManagementService.getStudentsPaginated(
                effectiveQuery, null, "SUCCESS", null, null, pageable
        );
        return ResponseEntity.ok(ApiResponse.success("Eligible paid students retrieved successfully", page));
    }

    @GetMapping({"/eligible-students/count", "/templates/eligible-students/count"})
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('EMAIL_SEND')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getEligiblePaidStudentsCount() {
        Page<AdminStudentListItemResponse> page = studentManagementService.getStudentsPaginated(
                null, null, "SUCCESS", null, null, Pageable.unpaged()
        );
        return ResponseEntity.ok(ApiResponse.success("Eligible recipient count retrieved", Map.of(
                "eligibleRecipients", page.getTotalElements()
        )));
    }

    @GetMapping({"/{id}", "/templates/{id}"})
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('EMAIL_SEND')")
    public ResponseEntity<ApiResponse<NotificationTemplateResponse>> getTemplateById(@PathVariable UUID id) {
        NotificationTemplateResponse response = notificationTemplateService.getTemplateById(id);
        return ResponseEntity.ok(ApiResponse.success("Email template retrieved successfully", response));
    }

    @PutMapping({"/{id}", "/templates/{id}"})
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('EMAIL_SEND')")
    public ResponseEntity<ApiResponse<NotificationTemplateResponse>> updateTemplate(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateNotificationTemplateRequest request
    ) {
        NotificationTemplateResponse response = notificationTemplateService.updateTemplate(id, request);
        return ResponseEntity.ok(ApiResponse.success("Email template updated successfully", response));
    }

    @PostMapping({"/{id}/publish", "/templates/{id}/publish"})
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('EMAIL_SEND')")
    public ResponseEntity<ApiResponse<NotificationTemplateResponse>> publishTemplate(@PathVariable UUID id) {
        NotificationTemplateResponse response = notificationTemplateService.publishTemplate(id);
        return ResponseEntity.ok(ApiResponse.success("Email template published live successfully", response));
    }

    @PostMapping({"/{id}/archive", "/templates/{id}/archive"})
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('EMAIL_SEND')")
    public ResponseEntity<ApiResponse<NotificationTemplateResponse>> archiveTemplate(@PathVariable UUID id) {
        NotificationTemplateResponse response = notificationTemplateService.archiveTemplate(id);
        return ResponseEntity.ok(ApiResponse.success("Email template archived successfully", response));
    }

    @PostMapping({"/{id}/duplicate", "/templates/{id}/duplicate"})
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('EMAIL_SEND')")
    public ResponseEntity<ApiResponse<NotificationTemplateResponse>> duplicateTemplate(
            @PathVariable UUID id,
            @AuthenticationPrincipal User currentUser
    ) {
        String adminStudentId = currentUser != null ? currentUser.getStudentId() : "system";
        NotificationTemplateResponse response = notificationTemplateService.duplicateTemplate(id, adminStudentId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Email template duplicated as draft successfully", response));
    }

    @DeleteMapping({"/{id}", "/templates/{id}"})
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('EMAIL_SEND')")
    public ResponseEntity<Void> deleteTemplate(@PathVariable UUID id) {
        notificationTemplateService.deleteTemplate(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping({"/test", "/templates/test"})
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('EMAIL_SEND')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> sendTestEmail(
            @RequestBody SendTestEmailRequest request
    ) {
        boolean sent = emailNotificationService.sendTestEmail(request);
        return ResponseEntity.ok(ApiResponse.success("Test email dispatched successfully", Map.of("success", sent)));
    }

    @PostMapping({"/{id}/test", "/templates/{id}/test"})
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('EMAIL_SEND')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> sendTestEmailById(
            @PathVariable UUID id,
            @RequestBody Map<String, Object> body
    ) {
        String singleEmail = (String) body.get("recipientEmail");
        List<String> recipients = (List<String>) body.get("recipients");
        Boolean sendToAll = (Boolean) body.get("sendToAll");
        Map<String, String> sampleData = (Map<String, String>) body.get("sampleData");

        SendTestEmailRequest request = new SendTestEmailRequest(id, singleEmail, recipients, sampleData, sendToAll);
        boolean sent = emailNotificationService.sendTestEmail(request);
        return ResponseEntity.ok(ApiResponse.success("Test email dispatched successfully", Map.of("success", sent)));
    }
}
