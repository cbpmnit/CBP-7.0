package com.cbp7.registration.validator;

import com.cbp7.identity.profile.entity.StudentType;
import com.cbp7.registration.dto.request.CreatePublicOrderRequest;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

@Component
public class PublicRegistrationValidator {

    public void validateCreateOrderRequest(CreatePublicOrderRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Registration request cannot be null");
        }

        if (!StringUtils.hasText(request.fullName())) {
            throw new IllegalArgumentException("Full name is required");
        }

        if (!StringUtils.hasText(request.studentId())) {
            throw new IllegalArgumentException("Student ID is required");
        }

        if (!StringUtils.hasText(request.email())) {
            throw new IllegalArgumentException("Email is required");
        }

        if (!StringUtils.hasText(request.mobileNumber()) || !request.mobileNumber().matches("^\\d{10}$")) {
            throw new IllegalArgumentException("Mobile number must be exactly 10 digits");
        }

        if (request.programLevel() == null) {
            throw new IllegalArgumentException("Program level is required");
        }

        if (!StringUtils.hasText(request.department())) {
            throw new IllegalArgumentException("Department is required");
        }

        if (isOtherDepartment(request.department())) {
            if (!StringUtils.hasText(request.customDepartment())) {
                throw new IllegalArgumentException("Custom department name is required when selecting 'Other'");
            }
        }

        if (request.year() == null || request.year() < 1 || request.year() > 5) {
            throw new IllegalArgumentException("Year of study must be between 1 and 5");
        }

        if (request.studentType() == null) {
            throw new IllegalArgumentException("Student category is required");
        }

        if (request.studentType() == StudentType.DAY_SCHOLAR) {
            if (!StringUtils.hasText(request.address())) {
                throw new IllegalArgumentException("Address is required for Day Scholars");
            }
        } else if (request.studentType() == StudentType.HOSTELLER) {
            if (!StringUtils.hasText(request.hostelNumber())) {
                throw new IllegalArgumentException("Hostel number is required for Hostellers");
            }
            if (!StringUtils.hasText(request.roomNumber())) {
                throw new IllegalArgumentException("Room number is required for Hostellers");
            }
        }
    }

    public static boolean isOtherDepartment(String dept) {
        return dept != null && (dept.equalsIgnoreCase("Other") || dept.equalsIgnoreCase("OTHER"));
    }
}
