package com.cbp7.platform.admin.student.dto.request;

public record UpdateStudentProfileRequest(
        String firstName,
        String lastName,
        String phone,
        String email,
        String gender,
        String dob,
        String programLevel,
        String department,
        String year,
        String section,
        String studentType,
        String address,
        String hostelNumber,
        Boolean hosteller,
        String roomNumber,
        String city,
        String state
) {}
