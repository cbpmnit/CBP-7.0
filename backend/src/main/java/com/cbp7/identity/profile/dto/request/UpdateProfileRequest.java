package com.cbp7.identity.profile.dto.request;

import com.cbp7.identity.profile.entity.Gender;
import com.cbp7.identity.profile.entity.ProgramLevel;
import com.cbp7.identity.profile.entity.StudentType;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
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

        @NotNull(message = "Program level is required")
        ProgramLevel programLevel,

        @NotBlank(message = "Department is required")
        String department,

        @NotNull(message = "Year is required")
        @Min(value = 1, message = "Year must be at least 1")
        @Max(value = 5, message = "Year must be at most 5")
        Integer year,

        String section,

        StudentType studentType,

        String address,

        String hostelNumber,

        Boolean hosteller,

        String roomNumber,

        String city,

        String state
) {}
