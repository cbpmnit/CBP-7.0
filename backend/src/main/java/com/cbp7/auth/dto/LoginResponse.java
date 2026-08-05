package com.cbp7.auth.dto;

public record LoginResponse(
        String token,
        String studentId,
        String name,
        String role
) {}
