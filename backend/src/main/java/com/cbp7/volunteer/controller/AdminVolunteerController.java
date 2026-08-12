package com.cbp7.volunteer.controller;

import com.cbp7.auth.entity.User;
import com.cbp7.common.response.ApiResponse;
import com.cbp7.volunteer.dto.request.*;
import com.cbp7.volunteer.dto.response.*;
import com.cbp7.volunteer.service.VolunteerInvitationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/volunteers")
@RequiredArgsConstructor
public class AdminVolunteerController {

    private final VolunteerInvitationService volunteerInvitationService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<VolunteerListItemResponse>>> getAllVolunteers() {
        List<VolunteerListItemResponse> response = volunteerInvitationService.getAllVolunteers();
        return ResponseEntity.ok(ApiResponse.success("Volunteers directory retrieved successfully", response));
    }

    @GetMapping("/export")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<byte[]> exportVolunteersCsv(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status
    ) {
        byte[] csvBytes = volunteerInvitationService.exportVolunteersCsv(search, status);
        String filename = "cbp-volunteers-" + java.time.LocalDate.now() + ".csv";
        return ResponseEntity.ok()
                .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                .contentType(org.springframework.http.MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .body(csvBytes);
    }

    @GetMapping("/invitations")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<VolunteerInvitationResponse>>> getPendingInvitations() {
        List<VolunteerInvitationResponse> response = volunteerInvitationService.getPendingInvitations();
        return ResponseEntity.ok(ApiResponse.success("Pending volunteer invitations retrieved successfully", response));
    }

    @GetMapping("/invitations/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<VolunteerInvitationResponse>> getInvitationById(@PathVariable UUID id) {
        VolunteerInvitationResponse response = volunteerInvitationService.getInvitationById(id);
        return ResponseEntity.ok(ApiResponse.success("Invitation details retrieved successfully", response));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<VolunteerDetailResponse>> getVolunteerById(@PathVariable String id) {
        VolunteerDetailResponse response = volunteerInvitationService.getVolunteerById(id);
        return ResponseEntity.ok(ApiResponse.success("Volunteer details retrieved successfully", response));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<VolunteerInviteCheckResponse>> createVolunteer(
            @AuthenticationPrincipal User adminUser,
            @Valid @RequestBody InviteVolunteerRequest request
    ) {
        String adminId = adminUser != null ? adminUser.getStudentId() : "admin";
        VolunteerInviteCheckResponse response = volunteerInvitationService.inviteVolunteer(request, adminId);
        return ResponseEntity.ok(ApiResponse.success("Volunteer invite check processed successfully", response));
    }

    @PostMapping("/invite")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<VolunteerInviteCheckResponse>> inviteVolunteer(
            @AuthenticationPrincipal User adminUser,
            @Valid @RequestBody InviteVolunteerRequest request
    ) {
        String adminId = adminUser != null ? adminUser.getStudentId() : "admin";
        VolunteerInviteCheckResponse response = volunteerInvitationService.inviteVolunteer(request, adminId);
        return ResponseEntity.ok(ApiResponse.success("Volunteer invite check processed successfully", response));
    }

    @PostMapping("/{userId}/grant-access")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<VolunteerDetailResponse>> grantVolunteerAccess(
            @AuthenticationPrincipal User adminUser,
            @PathVariable String userId,
            @RequestBody GrantVolunteerAccessRequest request
    ) {
        String adminId = adminUser != null ? adminUser.getStudentId() : "admin";
        GrantVolunteerAccessRequest finalRequest = new GrantVolunteerAccessRequest(
                userId,
                request.name(),
                request.permissions(),
                request.assignedSessions()
        );
        VolunteerDetailResponse response = volunteerInvitationService.grantVolunteerAccess(finalRequest, adminId);
        return ResponseEntity.ok(ApiResponse.success("Volunteer access granted successfully to user", response));
    }

    @PostMapping("/grant-access")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<VolunteerDetailResponse>> grantVolunteerAccessDirect(
            @AuthenticationPrincipal User adminUser,
            @Valid @RequestBody GrantVolunteerAccessRequest request
    ) {
        String adminId = adminUser != null ? adminUser.getStudentId() : "admin";
        VolunteerDetailResponse response = volunteerInvitationService.grantVolunteerAccess(request, adminId);
        return ResponseEntity.ok(ApiResponse.success("Volunteer access granted successfully", response));
    }

    @PutMapping("/{id}/permissions")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<VolunteerDetailResponse>> updateVolunteerPermissions(
            @PathVariable String id,
            @RequestBody UpdateVolunteerPermissionsRequest request
    ) {
        VolunteerDetailResponse response = volunteerInvitationService.updateVolunteerPermissions(id, request);
        return ResponseEntity.ok(ApiResponse.success("Volunteer permission scopes updated successfully", response));
    }

    @PostMapping("/invitations/{id}/resend")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<VolunteerInvitationResponse>> resendInvitationDirect(
            @AuthenticationPrincipal User adminUser,
            @PathVariable UUID id
    ) {
        String adminId = adminUser != null ? adminUser.getStudentId() : "admin";
        VolunteerInvitationResponse response = volunteerInvitationService.resendInvitation(id, adminId);
        return ResponseEntity.ok(ApiResponse.success("Volunteer invitation resent successfully", response));
    }

    @PostMapping("/invitations/{id}/revoke")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> revokeInvitation(
            @AuthenticationPrincipal User adminUser,
            @PathVariable UUID id
    ) {
        String adminId = adminUser != null ? adminUser.getStudentId() : "admin";
        volunteerInvitationService.revokeInvitation(id, adminId);
        return ResponseEntity.ok(ApiResponse.success("Volunteer invitation revoked successfully", "Invitation revoked"));
    }

    @PostMapping("/{invitationId}/resend")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<VolunteerInvitationResponse>> resendInvitation(
            @AuthenticationPrincipal User adminUser,
            @PathVariable UUID invitationId
    ) {
        String adminId = adminUser != null ? adminUser.getStudentId() : "admin";
        VolunteerInvitationResponse response = volunteerInvitationService.resendInvitation(invitationId, adminId);
        return ResponseEntity.ok(ApiResponse.success("Volunteer invitation resent successfully", response));
    }

    @PostMapping("/{id}/resend-invitation")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<VolunteerInvitationResponse>> resendInvitationAlias(
            @AuthenticationPrincipal User adminUser,
            @PathVariable String id
    ) {
        String adminId = adminUser != null ? adminUser.getStudentId() : "admin";
        UUID invitationId = UUID.fromString(id);
        VolunteerInvitationResponse response = volunteerInvitationService.resendInvitation(invitationId, adminId);
        return ResponseEntity.ok(ApiResponse.success("Volunteer invitation resent successfully", response));
    }

    @PostMapping("/{id}/disable")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> disableVolunteer(
            @AuthenticationPrincipal User adminUser,
            @PathVariable String id
    ) {
        String adminId = adminUser != null ? adminUser.getStudentId() : "admin";
        volunteerInvitationService.disableVolunteer(id, adminId);
        return ResponseEntity.ok(ApiResponse.success("Volunteer status updated successfully", "Volunteer status toggled"));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> deleteVolunteer(
            @AuthenticationPrincipal User adminUser,
            @PathVariable String id
    ) {
        String adminId = adminUser != null ? adminUser.getStudentId() : "admin";
        volunteerInvitationService.disableVolunteer(id, adminId);
        return ResponseEntity.ok(ApiResponse.success("Volunteer account disabled or revoked successfully", "Volunteer revoked/disabled"));
    }
}
