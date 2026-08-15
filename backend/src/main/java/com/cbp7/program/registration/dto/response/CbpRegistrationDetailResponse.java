package com.cbp7.program.registration.dto.response;

import com.cbp7.program.registration.dto.common.ProfileSnapshotDto;
import com.cbp7.program.registration.entity.RegistrationStatus;

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
        String programLevel,
        String department,
        Integer year,
        String section,
        String studentType,
        String address,
        String hostelNumber,
        Boolean hosteller,
        String roomNumber,
        String city,
        String state,
        Boolean paymentCompleted,
        ProfileSnapshotDto profile
) {}
