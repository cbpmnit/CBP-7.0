package com.cbp7.auth.controller;

import com.cbp7.auth.dto.request.LoginRequest;
import com.cbp7.auth.dto.request.ProfileUpdateRequest;
import com.cbp7.auth.dto.request.RegisterRequest;
import com.cbp7.auth.dto.response.LoginResponse;
import com.cbp7.auth.dto.response.UserResponse;
import com.cbp7.auth.entity.User;
import com.cbp7.auth.service.AuthService;
import com.cbp7.common.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping({"/api/v1/auth", "/api/auth"})
@RequiredArgsConstructor
@lombok.extern.slf4j.Slf4j
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Void>> register(@Valid @RequestBody RegisterRequest request) {
        String message = authService.register(request);
        return ResponseEntity.ok(ApiResponse.success(message));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout() {
        String message = authService.logout();
        return ResponseEntity.ok(ApiResponse.success(message));
    }

    @GetMapping("/google")
    public void redirectToGoogleOauth(jakarta.servlet.http.HttpServletResponse response) throws java.io.IOException {
        log.info("Google OAuth authentication initiated");
        response.sendRedirect("/oauth2/authorization/google");
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> me(@AuthenticationPrincipal User user) {
        UserResponse response = authService.getCurrentUser(user);
        return ResponseEntity.ok(ApiResponse.success("User profile retrieved", response));
    }

    @org.springframework.web.bind.annotation.PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserResponse>> updateProfile(
            @AuthenticationPrincipal User user,
            @Valid @RequestBody ProfileUpdateRequest request
    ) {
        UserResponse response = authService.updateProfile(user, request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully", response));
    }
}
