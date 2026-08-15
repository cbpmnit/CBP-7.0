package com.cbp7.registration.dto.request;

import com.cbp7.identity.profile.entity.ProgramLevel;
import com.cbp7.identity.profile.entity.StudentType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record CreatePublicOrderRequest(
        @NotBlank(message = "Full name is required")
        String fullName,

        @NotBlank(message = "Student ID is required")
        String studentId,

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        String email,

        @NotBlank(message = "Mobile number is required")
        @Pattern(regexp = "^\\d{10}$", message = "Mobile number must be 10 digits")
        String mobileNumber,

        @NotNull(message = "Program level is required")
        ProgramLevel programLevel,

        @NotBlank(message = "Department is required")
        String department,

        String customDepartment,

        @NotNull(message = "Year is required")
        @Min(value = 1, message = "Year must be between 1 and 5")
        @Max(value = 5, message = "Year must be between 1 and 5")
        Integer year,

        @NotNull(message = "Student category is required")
        StudentType studentType,

        String address,

        String hostelNumber,

        String roomNumber,

        String expectations
) {}
