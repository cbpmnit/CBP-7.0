package com.cbp7.identity.profile.dto.request;

import com.cbp7.identity.profile.entity.Branch;
import com.cbp7.identity.profile.entity.Course;
import com.cbp7.identity.profile.entity.Gender;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;

import java.time.LocalDate;

public record UpdateProfileRequest(
        @NotBlank(message = "First name is required")
        String firstName,

        String middleName,

        @NotBlank(message = "Last name is required")
        String lastName,

        String profilePhotoUrl,

        @NotNull(message = "Gender is required")
        Gender gender,

        @Past(message = "Date of birth cannot be in the future")
        LocalDate dateOfBirth,

        @NotBlank(message = "Phone number is required")
        @Pattern(regexp = "^\\d{10}$", message = "Phone number must be exactly 10 digits")
        String phoneNumber,

        Boolean sameAsWhatsapp,

        @Pattern(regexp = "^$|^\\d{10}$", message = "WhatsApp number must be exactly 10 digits")
        String whatsappNumber,

        String institute,

        @NotNull(message = "Course is required")
        Course course,

        @NotNull(message = "Branch is required")
        Branch branch,

        @NotNull(message = "Year is required")
        Integer year,

        String section,

        @NotNull(message = "Hosteller status is required")
        Boolean hosteller,

        String roomNumber,

        String city,

        String state
) {}
