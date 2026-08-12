package com.cbp7.platform.volunteer.dto.response;

public record VerifyInvitationResponse(
        String email,
        String name,
        boolean valid,
        String message
) {}
