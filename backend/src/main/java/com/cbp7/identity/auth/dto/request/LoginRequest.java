package com.cbp7.identity.auth.dto.request;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @JsonAlias({"identifier", "email", "username"})
        String identifier,

        @JsonAlias({"studentId", "username"})
        String studentId,

        @NotBlank(message = "Password is required")
        String password
) {
    public LoginRequest(String identifierOrStudentId, String password) {
        this(identifierOrStudentId, identifierOrStudentId, password);
    }

    public String getEffectiveIdentifier() {
        if (identifier != null && !identifier.isBlank()) {
            return identifier.trim();
        }
        if (studentId != null && !studentId.isBlank()) {
            return studentId.trim();
        }
        return "";
    }
}
