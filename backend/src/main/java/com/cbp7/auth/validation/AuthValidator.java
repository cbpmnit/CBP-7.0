package com.cbp7.auth.validation;

import com.cbp7.auth.dto.request.LoginRequest;
import com.cbp7.auth.dto.request.ProfileUpdateRequest;
import com.cbp7.auth.dto.request.RegisterRequest;
import com.cbp7.auth.entity.AuthProvider;
import com.cbp7.auth.entity.User;
import com.cbp7.common.exception.DuplicateResourceException;
import com.cbp7.common.exception.ForbiddenException;
import com.cbp7.common.exception.InvalidCredentialsException;
import com.cbp7.common.exception.UnauthorizedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class AuthValidator {

    public void validateRegistration(RegisterRequest request, boolean studentIdExists, boolean emailExists) {
        if (request == null) {
            throw new IllegalArgumentException("Registration request cannot be null");
        }

        String studentId = request.studentId() != null ? request.studentId().trim().toLowerCase() : "";
        String email = request.studentEmail() != null ? request.studentEmail().trim().toLowerCase() : "";
        String name = request.name() != null ? request.name().trim() : "";
        String password = request.password() != null ? request.password().trim() : "";
        String confirmPassword = request.confirmPassword() != null && !request.confirmPassword().isBlank()
                ? request.confirmPassword().trim()
                : password;

        if (studentId.isEmpty() || email.isEmpty() || name.isEmpty() || password.isEmpty()) {
            throw new IllegalArgumentException("All required fields must be provided");
        }

        if (!password.equals(confirmPassword)) {
            throw new IllegalArgumentException("Password and confirm password do not match");
        }

        if (studentIdExists) {
            throw new DuplicateResourceException("Student ID is already registered");
        }

        if (emailExists) {
            throw new DuplicateResourceException("Email is already registered");
        }
    }

    public void validateLoginRequest(LoginRequest request) {
        if (request == null || request.getEffectiveIdentifier().isBlank() || request.password() == null) {
            throw new IllegalArgumentException("Student ID / email and password must be provided");
        }
    }

    public void validateUserForLogin(User user, String rawPassword, PasswordEncoder passwordEncoder) {
        if (user.getAuthProvider() == AuthProvider.GOOGLE || user.getPassword() == null) {
            throw new InvalidCredentialsException("This account uses Google authentication. Please continue with Google login.");
        }

        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new InvalidCredentialsException("Invalid Student ID/email or password");
        }

        if (!Boolean.TRUE.equals(user.getEnabled())) {
            throw new ForbiddenException("Account is disabled");
        }
    }

    public void validateAuthenticatedUser(User user) {
        if (user == null) {
            throw new UnauthorizedException("User is not authenticated");
        }
    }

    public void validateGoogleEmail(String email) {
        if (email == null || email.isBlank()) {
            throw new IllegalArgumentException("Google account email must not be null or empty");
        }
    }

    public void validateProfileUpdate(User currentUser, ProfileUpdateRequest request) {
        validateAuthenticatedUser(currentUser);
        if (request == null || request.studentId() == null || request.studentId().isBlank()) {
            throw new IllegalArgumentException("Student ID is required");
        }
    }
}
