package com.cbp7.profile.controller;

import com.cbp7.auth.entity.User;
import com.cbp7.common.response.ApiResponse;
import com.cbp7.profile.dto.CreateProfileRequest;
import com.cbp7.profile.dto.ProfileCompletionResponse;
import com.cbp7.profile.dto.ProfileResponse;
import com.cbp7.profile.dto.UpdateProfileRequest;
import com.cbp7.profile.service.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<ProfileResponse>> getMyProfile(@AuthenticationPrincipal User user) {
        ProfileResponse response = profileService.getProfile(user);
        return ResponseEntity.ok(ApiResponse.success("Profile retrieved successfully", response));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProfileResponse>> createProfile(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody CreateProfileRequest request
    ) {
        ProfileResponse response = profileService.createProfile(user, request);
        return ResponseEntity.ok(ApiResponse.success("Profile created successfully", response));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<ProfileResponse>> updateProfile(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        ProfileResponse response = profileService.updateProfile(user, request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", response));
    }

    @GetMapping("/completion")
    public ResponseEntity<ApiResponse<ProfileCompletionResponse>> getProfileCompletion(@AuthenticationPrincipal User user) {
        ProfileCompletionResponse response = profileService.getProfileCompletion(user);
        return ResponseEntity.ok(ApiResponse.success("Profile completion retrieved successfully", response));
    }
}
