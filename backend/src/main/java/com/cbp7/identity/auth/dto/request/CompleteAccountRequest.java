package com.cbp7.identity.auth.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CompleteAccountRequest(
        @NotBlank(message = "Student ID is required")
        String studentId,

        @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least 6 characters long")
        String password,

        @NotBlank(message = "Confirm password is required")
        String confirmPassword
) {}
