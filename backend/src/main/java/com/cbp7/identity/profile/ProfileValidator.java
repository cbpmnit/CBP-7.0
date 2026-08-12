package com.cbp7.identity.profile;

import com.cbp7.identity.auth.entity.User;
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
            Boolean hosteller,
            String roomNumber,
            String phoneNumber,
            Boolean sameAsWhatsapp,
            String whatsappNumber
    ) {
        if (dateOfBirth != null && dateOfBirth.isAfter(LocalDate.now())) {
            throw new IllegalArgumentException("Date of birth cannot be in the future");
        }

        if (Boolean.TRUE.equals(hosteller) && !StringUtils.hasText(roomNumber)) {
            throw new IllegalArgumentException("Room number is required when hosteller is true");
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
