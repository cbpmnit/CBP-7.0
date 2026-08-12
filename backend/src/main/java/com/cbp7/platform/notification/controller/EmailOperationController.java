package com.cbp7.platform.notification.controller;

import com.cbp7.identity.auth.entity.User;
import com.cbp7.common.response.ApiResponse;
import com.cbp7.platform.notification.dto.request.CreateEmailOperationRequest;
import com.cbp7.platform.notification.dto.response.EmailLogDto;
import com.cbp7.platform.notification.dto.response.EmailOperationDto;
import com.cbp7.platform.notification.service.EmailOperationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping({"/api/v1/admin/email-operations", "/api/email/operations", "/api/email"})
@RequiredArgsConstructor
public class EmailOperationController {

    private final EmailOperationService emailOperationService;

    @GetMapping({"", "/operations"})
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('EMAIL_SEND')")
    public ResponseEntity<ApiResponse<List<EmailOperationDto>>> getAllOperations() {
        List<EmailOperationDto> operations = emailOperationService.getAllOperations();
        return ResponseEntity.ok(ApiResponse.success("Email operations retrieved successfully", operations));
    }

    @GetMapping({"/{id}", "/operations/{id}"})
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('EMAIL_SEND')")
    public ResponseEntity<ApiResponse<EmailOperationDto>> getOperationById(@PathVariable UUID id) {
        EmailOperationDto operation = emailOperationService.getOperationById(id);
        return ResponseEntity.ok(ApiResponse.success("Email operation retrieved successfully", operation));
    }

    @PostMapping({"", "/operations", "/operations/send"})
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('EMAIL_SEND')")
    public ResponseEntity<ApiResponse<EmailOperationDto>> executeOperation(
            @AuthenticationPrincipal User currentUser,
            @Valid @RequestBody CreateEmailOperationRequest request
    ) {
        String adminStudentId = currentUser != null ? currentUser.getStudentId() : "system";
        EmailOperationDto operation = emailOperationService.executeOperation(request, adminStudentId);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Email operation dispatched successfully", operation));
    }

    @GetMapping({"/logs", "/operations/logs"})
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('EMAIL_SEND')")
    public ResponseEntity<ApiResponse<Page<EmailLogDto>>> getDeliveryLogs(
            @PageableDefault(size = 30) Pageable pageable
    ) {
        Page<EmailLogDto> logs = emailOperationService.getDeliveryLogs(pageable);
        return ResponseEntity.ok(ApiResponse.success("Email delivery logs retrieved successfully", logs));
    }

    @GetMapping({"/operations/{id}/logs", "/{id}/logs"})
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('EMAIL_SEND')")
    public ResponseEntity<ApiResponse<List<EmailLogDto>>> getLogsByOperation(@PathVariable UUID id) {
        List<EmailLogDto> logs = emailOperationService.getLogsByOperationId(id);
        return ResponseEntity.ok(ApiResponse.success("Operation delivery logs retrieved", logs));
    }

    @GetMapping({"/logs/export", "/operations/logs/export"})
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('EMAIL_SEND')")
    public ResponseEntity<byte[]> exportEmailLogsCsv() {
        byte[] csvBytes = emailOperationService.exportEmailLogsCsv();
        String filename = "cbp-email-logs-" + java.time.LocalDate.now() + ".csv";
        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(org.springframework.http.MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(csvBytes);
    }
}
