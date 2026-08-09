package com.cbp7.auth.dto;

import jakarta.validation.constraints.NotBlank;

public record ProfileUpdateRequest(
        @NotBlank(message = "Student ID is required")
        String studentId,
        String phoneNumber
) {}
