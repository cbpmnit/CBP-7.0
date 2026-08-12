package com.cbp7.program.attendance.qr.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.util.Set;
import java.util.UUID;

public record RegenerateSelectedQrRequest(
        @NotNull(message = "Session ID is required")
        UUID sessionId,

        @NotEmpty(message = "studentIds set cannot be empty")
        Set<String> studentIds,

        Boolean force
) {
    public boolean isForce() {
        return Boolean.TRUE.equals(force);
    }
}
