package com.cbp7.volunteer.dto.request;

import java.util.Set;

public record UpdateVolunteerPermissionsRequest(
        Set<String> permissions,
        Set<String> assignedSessions
) {}
