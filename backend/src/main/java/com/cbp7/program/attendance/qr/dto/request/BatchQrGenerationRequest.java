package com.cbp7.program.attendance.qr.dto.request;

import com.cbp7.program.attendance.qr.entity.QrGenerationMode;
import jakarta.validation.constraints.NotNull;

import java.util.Set;
import java.util.UUID;

public record BatchQrGenerationRequest(
        @NotNull(message = "Session ID is required")
        UUID sessionId,

        QrGenerationMode mode,

        Set<String> studentIds
) {
    public QrGenerationMode getEffectiveMode() {
        return mode != null ? mode : QrGenerationMode.MISSING_ONLY;
    }
}
