package com.cbp7.auth.dto.response;

import java.util.Set;

public record UserResponse(
        String id,
        String userId,
        String studentId,
        String email,
        String name,
        String phoneNumber,
        String role,
        Set<String> roles,
        Set<String> permissions
) {
    public UserResponse(String studentId, String email, String name, String phoneNumber, String role) {
        this(null, null, studentId, email, name, phoneNumber, role, role != null ? Set.of(role) : Set.of(), Set.of());
    }

    public UserResponse(String studentId, String email, String name, String phoneNumber, String role, Set<String> permissions) {
        this(null, null, studentId, email, name, phoneNumber, role, role != null ? Set.of(role) : Set.of(), permissions != null ? permissions : Set.of());
    }
}
