package com.cbp7.cbp.dto;

import com.cbp7.cbp.enums.RegistrationStatus;

import java.time.LocalDateTime;

public record CbpRegistrationDetailResponse(
        String registrationId,
        RegistrationStatus registrationStatus,
        LocalDateTime createdAt,
        ProfileSnapshotDto profile
) {}
