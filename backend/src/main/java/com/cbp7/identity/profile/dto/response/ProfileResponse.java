package com.cbp7.identity.profile.dto.response;

import com.cbp7.identity.profile.entity.Branch;
import com.cbp7.identity.profile.entity.Course;
import com.cbp7.identity.profile.entity.Gender;

import java.time.LocalDate;

public record ProfileResponse(
        String name,
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
) {
    public ProfileResponse(
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
    ) {
        this(
                buildCombinedName(firstName, middleName, lastName),
                studentId,
                email,
                firstName,
                middleName,
                lastName,
                profilePhotoUrl,
                gender,
                dateOfBirth,
                phoneNumber,
                sameAsWhatsapp,
                whatsappNumber,
                institute,
                course,
                branch,
                year,
                section,
                hosteller,
                roomNumber,
                city,
                state
        );
    }

    private static String buildCombinedName(String first, String middle, String last) {
        StringBuilder sb = new StringBuilder();
        if (first != null && !first.isBlank()) sb.append(first.trim());
        if (middle != null && !middle.isBlank()) {
            if (sb.length() > 0) sb.append(" ");
            sb.append(middle.trim());
        }
        if (last != null && !last.isBlank()) {
            if (sb.length() > 0) sb.append(" ");
            sb.append(last.trim());
        }
        return sb.toString().trim();
    }
}
