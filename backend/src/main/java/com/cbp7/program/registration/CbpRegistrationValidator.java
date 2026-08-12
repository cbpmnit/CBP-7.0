package com.cbp7.program.registration;

import com.cbp7.identity.auth.entity.Role;
import com.cbp7.identity.auth.entity.User;
import com.cbp7.common.exception.ForbiddenException;
import com.cbp7.common.exception.ProfileIncompleteException;
import com.cbp7.common.exception.RegistrationAlreadyExistsException;
import com.cbp7.common.exception.UnauthorizedException;
import com.cbp7.identity.profile.entity.ProfileCompletion;
import org.springframework.stereotype.Component;

@Component
public class CbpRegistrationValidator {

    public void validateStudentRole(User user) {
        if (user == null) {
            throw new UnauthorizedException("User is not authenticated.");
        }
        if (user.getRole() != Role.ROLE_STUDENT) {
            throw new ForbiddenException("Only students can perform CBP registration.");
        }
    }

    public void validateRegistrationPreconditions(boolean alreadyExists, ProfileCompletion completion) {
        if (alreadyExists) {
            throw new RegistrationAlreadyExistsException("You are already registered for CBP.");
        }

        if (completion == null || !Boolean.TRUE.equals(completion.getProfileCompleted())) {
            throw new ProfileIncompleteException("Please complete your profile before registering.");
        }
    }
}
