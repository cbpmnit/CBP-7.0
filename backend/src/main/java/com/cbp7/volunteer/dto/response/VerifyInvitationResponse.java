package com.cbp7.volunteer.dto.response;

public record VerifyInvitationResponse(
        String email,
        String name,
        boolean valid,
        String message
) {}
