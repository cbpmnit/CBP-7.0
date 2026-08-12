package com.cbp7.identity.auth.dto.request;

import jakarta.validation.constraints.NotBlank;

public record ProfileUpdateRequest(
        @NotBlank(message = "Student ID is required")
        String studentId,
        String phoneNumber
) {}
