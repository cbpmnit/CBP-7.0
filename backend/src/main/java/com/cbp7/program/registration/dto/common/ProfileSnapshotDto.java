package com.cbp7.program.registration.dto.common;

public record ProfileSnapshotDto(
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
        String state
) {}
