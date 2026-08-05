package com.cbp7.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record RegisterRequest(
        @NotBlank(message = "Student ID is required")
        String studentId,

        @NotBlank(message = "Student email is required")
        @Email(message = "Invalid email format")
        String studentEmail,

        @NotBlank(message = "Name is required")
        String name,

        String phoneNumber,

        @NotBlank(message = "Password is required")
        String password,

        @NotBlank(message = "Confirm password is required")
        String confirmPassword
) {}
