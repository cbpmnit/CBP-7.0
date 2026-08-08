package com.cbp7.auth.dto;

import java.util.Set;

public record LoginResponse(
        String token,
        String studentId,
        String name,
        String role,
        Set<String> permissions
) {
    public LoginResponse(String token, String studentId, String name, String role) {
        this(token, studentId, name, role, Set.of());
    }
}
