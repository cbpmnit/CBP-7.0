package com.cbp7.volunteer.dto;

import java.util.Set;

public record UpdateVolunteerPermissionsRequest(
        Set<String> permissions,
        Set<String> assignedSessions
) {}
