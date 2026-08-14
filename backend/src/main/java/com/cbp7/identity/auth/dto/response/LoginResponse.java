package com.cbp7.identity.auth.dto.response;

import java.util.Set;

public record LoginResponse(
        String token,
        String userId,
        String studentId,
        String name,
        String role,
        Set<String> roles,
        Set<String> permissions,
        Boolean accountSetupCompleted,
        Boolean profileCompleted
) {
    public LoginResponse(String token, String studentId, String name, String role) {
        this(token, null, studentId, name, role, role != null ? Set.of(role) : Set.of(), Set.of(), true, false);
    }

    public LoginResponse(String token, String studentId, String name, String role, Set<String> permissions) {
        this(token, null, studentId, name, role, role != null ? Set.of(role) : Set.of(), permissions != null ? permissions : Set.of(), true, false);
    }
}
