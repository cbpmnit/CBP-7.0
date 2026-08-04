package com.cbp7.auth.dto;

public record UserResponse(
        String studentId,
        String email,
        String name,
        String phoneNumber,
        String role
) {}
