package com.cbp7.volunteer.dto;

public record VerifyInvitationResponse(
        String email,
        String name,
        boolean valid,
        String message
) {}
