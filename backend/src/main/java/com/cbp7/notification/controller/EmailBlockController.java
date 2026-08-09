package com.cbp7.notification.controller;

import com.cbp7.common.response.ApiResponse;
import com.cbp7.notification.dto.CreateEmailBlockRequest;
import com.cbp7.notification.dto.EmailBlockDto;
import com.cbp7.notification.service.EmailBlockService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping({"/api/v1/admin/email-blocks", "/api/email/blocks"})
@RequiredArgsConstructor
public class EmailBlockController {

    private final EmailBlockService emailBlockService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('EMAIL_SEND')")
    public ResponseEntity<ApiResponse<List<EmailBlockDto>>> getAllBlocks(
            @RequestParam(required = false, defaultValue = "false") boolean activeOnly
    ) {
        List<EmailBlockDto> blocks = activeOnly
                ? emailBlockService.getActiveBlocks()
                : emailBlockService.getAllBlocks();
        return ResponseEntity.ok(ApiResponse.success("Email blocks retrieved successfully", blocks));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('EMAIL_SEND')")
    public ResponseEntity<ApiResponse<EmailBlockDto>> getBlockById(@PathVariable UUID id) {
        EmailBlockDto block = emailBlockService.getBlockById(id);
        return ResponseEntity.ok(ApiResponse.success("Email block retrieved successfully", block));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('EMAIL_SEND')")
    public ResponseEntity<ApiResponse<EmailBlockDto>> createBlock(
            @Valid @RequestBody CreateEmailBlockRequest request
    ) {
        EmailBlockDto created = emailBlockService.createBlock(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Email block created successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('EMAIL_SEND')")
    public ResponseEntity<ApiResponse<EmailBlockDto>> updateBlock(
            @PathVariable UUID id,
            @Valid @RequestBody CreateEmailBlockRequest request
    ) {
        EmailBlockDto updated = emailBlockService.updateBlock(id, request);
        return ResponseEntity.ok(ApiResponse.success("Email block updated successfully", updated));
    }

    @PostMapping("/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('EMAIL_SEND')")
    public ResponseEntity<ApiResponse<EmailBlockDto>> toggleBlock(@PathVariable UUID id) {
        EmailBlockDto updated = emailBlockService.toggleBlockStatus(id);
        return ResponseEntity.ok(ApiResponse.success("Email block status updated", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN') or hasAuthority('EMAIL_SEND')")
    public ResponseEntity<Void> deleteBlock(@PathVariable UUID id) {
        emailBlockService.deleteBlock(id);
        return ResponseEntity.noContent().build();
    }
}
