package com.cbp7.program.registration;

import com.cbp7.identity.auth.entity.Role;
import com.cbp7.identity.auth.entity.User;
import com.cbp7.common.exception.ForbiddenException;
import com.cbp7.common.exception.ProfileIncompleteException;
import com.cbp7.common.exception.RegistrationAlreadyExistsException;
import com.cbp7.common.exception.UnauthorizedException;
import com.cbp7.identity.profile.ProfileEligibilityValidator;
import com.cbp7.identity.profile.entity.UserProfile;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class CbpRegistrationValidator {

    private final ProfileEligibilityValidator eligibilityValidator;

    public void validateStudentRole(User user) {
        if (user == null) {
            throw new UnauthorizedException("User is not authenticated.");
        }
        if (user.getRole() != Role.ROLE_STUDENT) {
            throw new ForbiddenException("Only students can perform CBP registration.");
        }
    }

    public void validateRegistrationPreconditions(boolean alreadyExists, UserProfile profile) {
        if (alreadyExists) {
            throw new RegistrationAlreadyExistsException("You are already registered for CBP.");
        }

        if (profile == null || !eligibilityValidator.canRegister(profile)) {
            List<String> missing = eligibilityValidator.getMissingMandatoryFields(profile);
            String details = missing.isEmpty() ? "" : ": " + String.join(", ", missing);
            throw new ProfileIncompleteException("Please complete mandatory profile details before registration" + details);
        }
    }
}
