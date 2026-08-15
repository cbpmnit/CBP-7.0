package com.cbp7.registration.dto.response;

public record PublicStatusCheckResponse(
        boolean registrationExists,
        String fullName,
        String studentId,
        String department,
        String programLevel,
        String paymentStatus,
        boolean accountVerified,
        String registrationDate,
        String message
) {
    public static PublicStatusCheckResponse notFound(String message) {
        return new PublicStatusCheckResponse(false, null, null, null, null, null, false, null, message);
    }
}
