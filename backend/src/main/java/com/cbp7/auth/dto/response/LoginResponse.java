package com.cbp7.auth.dto.response;

import java.util.Set;

public record LoginResponse(
        String token,
        String userId,
        String studentId,
        String name,
        String role,
        Set<String> roles,
        Set<String> permissions
) {
    public LoginResponse(String token, String studentId, String name, String role) {
        this(token, null, studentId, name, role, role != null ? Set.of(role) : Set.of(), Set.of());
    }

    public LoginResponse(String token, String studentId, String name, String role, Set<String> permissions) {
        this(token, null, studentId, name, role, role != null ? Set.of(role) : Set.of(), permissions != null ? permissions : Set.of());
    }
}
