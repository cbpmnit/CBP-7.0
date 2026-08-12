package com.cbp7.cbp.dto.response;

import com.cbp7.cbp.dto.common.ProfileSnapshotDto;
import com.cbp7.cbp.enums.RegistrationStatus;

import java.time.LocalDateTime;

public record CbpRegistrationDetailResponse(
        String registrationId,
        RegistrationStatus registrationStatus,
        LocalDateTime createdAt,
        String studentId,
        String firstName,
        String middleName,
        String lastName,
        String email,
        String phoneNumber,
        String institute,
        String course,
        String branch,
        Integer year,
        String section,
        Boolean hosteller,
        String roomNumber,
        String city,
        String state,
        Boolean paymentCompleted,
        ProfileSnapshotDto profile
) {}
