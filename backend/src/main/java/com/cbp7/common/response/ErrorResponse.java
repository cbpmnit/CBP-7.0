package com.cbp7.common.response;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;
import java.util.Map;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErrorResponse(
        boolean success,
        int status,
        String error,
        String message,
        String path,
        Map<String, String> errors,
        LocalDateTime timestamp
) {
    public static ErrorResponse of(int status, String error, String message, String path) {
        return new ErrorResponse(false, status, error, message, path, null, LocalDateTime.now());
    }

    public static ErrorResponse validationError(String message, Map<String, String> errors, String path) {
        return new ErrorResponse(false, 400, "Validation Failed", message, path, errors, LocalDateTime.now());
    }
}
