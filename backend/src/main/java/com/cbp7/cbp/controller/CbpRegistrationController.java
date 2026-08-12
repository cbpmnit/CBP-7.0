package com.cbp7.cbp.controller;

import com.cbp7.auth.entity.User;
import com.cbp7.cbp.dto.response.CbpRegistrationDetailResponse;
import com.cbp7.cbp.dto.response.CbpRegistrationResponse;
import com.cbp7.cbp.service.CbpRegistrationService;
import com.cbp7.common.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/cbp")
@RequiredArgsConstructor
public class CbpRegistrationController {

    private final CbpRegistrationService cbpRegistrationService;

    @PostMapping("/register")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<CbpRegistrationResponse>> register(@AuthenticationPrincipal User user) {
        CbpRegistrationResponse response = cbpRegistrationService.registerStudent(user);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("CBP registration completed successfully.", response));
    }

    @GetMapping("/me")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<CbpRegistrationDetailResponse>> getMyRegistration(@AuthenticationPrincipal User user) {
        CbpRegistrationDetailResponse response = cbpRegistrationService.getMyRegistration(user);
        return ResponseEntity.ok(ApiResponse.success("CBP registration details retrieved successfully.", response));
    }
}
