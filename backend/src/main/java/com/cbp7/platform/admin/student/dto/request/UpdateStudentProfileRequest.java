package com.cbp7.platform.admin.student.dto.request;

public record UpdateStudentProfileRequest(
        String firstName,
        String lastName,
        String phone,
        String email,
        String gender,
        String dob,
        String course,
        String branch,
        String year,
        String section,
        Boolean hosteller,
        String roomNumber,
        String city,
        String state
) {}
