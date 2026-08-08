package com.cbp7.auth.dto;

import java.util.Set;

public record UserResponse(
        String studentId,
        String email,
        String name,
        String phoneNumber,
        String role,
        Set<String> permissions
) {
    public UserResponse(String studentId, String email, String name, String phoneNumber, String role) {
        this(studentId, email, name, phoneNumber, role, Set.of());
    }
}
