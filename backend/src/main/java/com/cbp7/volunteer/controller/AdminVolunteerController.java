package com.cbp7.volunteer.controller;

import com.cbp7.auth.entity.User;
import com.cbp7.common.response.ApiResponse;
import com.cbp7.volunteer.dto.InviteVolunteerRequest;
import com.cbp7.volunteer.dto.VolunteerInvitationResponse;
import com.cbp7.volunteer.dto.VolunteerListItemResponse;
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

    @PostMapping("/invite")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<VolunteerInvitationResponse>> inviteVolunteer(
            @AuthenticationPrincipal User adminUser,
            @Valid @RequestBody InviteVolunteerRequest request
    ) {
        String adminId = adminUser != null ? adminUser.getStudentId() : "admin";
        VolunteerInvitationResponse response = volunteerInvitationService.inviteVolunteer(request, adminId);
        return ResponseEntity.ok(ApiResponse.success("Volunteer invitation sent successfully", response));
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

    @PostMapping("/{id}/disable")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> disableVolunteer(
            @AuthenticationPrincipal User adminUser,
            @PathVariable String id
    ) {
        String adminId = adminUser != null ? adminUser.getStudentId() : "admin";
        volunteerInvitationService.disableVolunteer(id, adminId);
        return ResponseEntity.ok(ApiResponse.success("Volunteer status updated successfully", "Volunteer disabled"));
    }
}
