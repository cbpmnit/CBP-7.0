package com.cbp7.volunteer.controller;

import com.cbp7.common.response.ApiResponse;
import com.cbp7.volunteer.dto.request.AcceptVolunteerInvitationRequest;
import com.cbp7.volunteer.dto.request.VolunteerPasswordSetupRequest;
import com.cbp7.volunteer.dto.response.AcceptVolunteerInvitationResponse;
import com.cbp7.volunteer.dto.response.VerifyInvitationResponse;
import com.cbp7.volunteer.service.VolunteerInvitationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/v1/auth/volunteer", "/api/auth/volunteer"})
@RequiredArgsConstructor
public class VolunteerAuthController {

    private final VolunteerInvitationService volunteerInvitationService;

    @GetMapping("/verify-invitation")
    public ResponseEntity<ApiResponse<VerifyInvitationResponse>> verifyInvitation(
            @RequestParam String token
    ) {
        VerifyInvitationResponse response = volunteerInvitationService.verifyInvitation(token);
        return ResponseEntity.ok(ApiResponse.success(response.message(), response));
    }

    @PostMapping("/accept-invitation")
    public ResponseEntity<ApiResponse<AcceptVolunteerInvitationResponse>> acceptInvitation(
            @Valid @RequestBody AcceptVolunteerInvitationRequest request
    ) {
        AcceptVolunteerInvitationResponse response = volunteerInvitationService.acceptInvitation(request);
        return ResponseEntity.ok(ApiResponse.success(response.message(), response));
    }

    @PostMapping("/setup-password")
    public ResponseEntity<ApiResponse<String>> setupPassword(
            @Valid @RequestBody VolunteerPasswordSetupRequest request
    ) {
        String message = volunteerInvitationService.setupPassword(request);
        return ResponseEntity.ok(ApiResponse.success("Account activated successfully", message));
    }
}
