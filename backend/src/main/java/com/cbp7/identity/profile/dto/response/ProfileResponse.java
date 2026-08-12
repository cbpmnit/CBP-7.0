package com.cbp7.identity.profile.dto.response;

import com.cbp7.identity.profile.entity.Branch;
import com.cbp7.identity.profile.entity.Course;
import com.cbp7.identity.profile.entity.Gender;

import java.time.LocalDate;

public record ProfileResponse(
        String studentId,
        String email,
        String firstName,
        String middleName,
        String lastName,
        String profilePhotoUrl,
        Gender gender,
        LocalDate dateOfBirth,
        String phoneNumber,
        Boolean sameAsWhatsapp,
        String whatsappNumber,
        String institute,
        Course course,
        Branch branch,
        Integer year,
        String section,
        Boolean hosteller,
        String roomNumber,
        String city,
        String state
) {}
