package com.cbp7.cbp.dto.common;

public record ProfileSnapshotDto(
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
        String state
) {}
