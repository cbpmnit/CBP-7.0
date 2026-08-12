package com.cbp7.auth.dto.request;

import com.fasterxml.jackson.annotation.JsonAlias;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record RegisterRequest(
        @NotBlank(message = "Student ID is required")
        @JsonAlias({"student_id", "id"})
        String studentId,

        @NotBlank(message = "Student email is required")
        @Email(message = "Invalid email format")
        @JsonAlias({"email", "student_email"})
        String studentEmail,

        @NotBlank(message = "Name is required")
        @JsonAlias({"full_name", "user_name"})
        String name,

        @JsonAlias({"phone_number", "phone"})
        String phoneNumber,

        @NotBlank(message = "Password is required")
        String password,

        @JsonAlias({"confirm_password"})
        String confirmPassword
) {}
