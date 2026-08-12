package com.cbp7.platform.volunteer.dto.response;

import java.util.Set;

public record AcceptVolunteerInvitationResponse(
        String email,
        String name,
        String role,
        Set<String> permissions,
        String message
) {}
