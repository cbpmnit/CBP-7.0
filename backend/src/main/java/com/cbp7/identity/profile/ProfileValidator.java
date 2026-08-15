package com.cbp7.identity.profile;

import com.cbp7.identity.auth.entity.User;
import com.cbp7.identity.profile.entity.ProgramLevel;
import com.cbp7.identity.profile.entity.StudentType;
import com.cbp7.common.exception.UnauthorizedException;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.regex.Pattern;

@Component
public class ProfileValidator {

    private static final Pattern PHONE_PATTERN = Pattern.compile("^\\d{10}$");

    public void validateAuthenticatedUser(User user) {
        if (user == null) {
            throw new UnauthorizedException("User is not authenticated");
        }
    }

    public void validateProfileFields(
            LocalDate dateOfBirth,
            ProgramLevel programLevel,
            String department,
            Integer year,
            StudentType studentType,
            String address,
            String hostelNumber,
            String roomNumber,
            String phoneNumber,
            Boolean sameAsWhatsapp,
            String whatsappNumber
    ) {
        if (dateOfBirth != null && dateOfBirth.isAfter(LocalDate.now())) {
            throw new IllegalArgumentException("Date of birth cannot be in the future");
        }

        if (programLevel == null) {
            throw new IllegalArgumentException("Program level is required");
        }

        if (!StringUtils.hasText(department)) {
            throw new IllegalArgumentException("Department is required");
        }

        if (year == null || year < 1 || year > 5) {
            throw new IllegalArgumentException("Year of study must be between 1 and 5");
        }

        if (studentType == StudentType.DAY_SCHOLAR) {
            if (!StringUtils.hasText(address)) {
                throw new IllegalArgumentException("Address is required for day scholars");
            }
        } else if (studentType == StudentType.HOSTELLER) {
            if (!StringUtils.hasText(hostelNumber)) {
                throw new IllegalArgumentException("Hostel number is required for hostellers");
            }
            if (!StringUtils.hasText(roomNumber)) {
                throw new IllegalArgumentException("Room number is required for hostellers");
            }
        }

        if (phoneNumber != null && !PHONE_PATTERN.matcher(phoneNumber.trim()).matches()) {
            throw new IllegalArgumentException("Phone number must be exactly 10 digits");
        }

        if (!Boolean.TRUE.equals(sameAsWhatsapp) && StringUtils.hasText(whatsappNumber)) {
            if (!PHONE_PATTERN.matcher(whatsappNumber.trim()).matches()) {
                throw new IllegalArgumentException("WhatsApp number must be exactly 10 digits");
            }
        }
    }
}
