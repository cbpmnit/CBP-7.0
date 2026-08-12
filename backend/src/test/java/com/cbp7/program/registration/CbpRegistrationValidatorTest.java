package com.cbp7.program.registration;

import com.cbp7.identity.auth.entity.Role;
import com.cbp7.identity.auth.entity.User;
import com.cbp7.program.registration.validation.CbpRegistrationValidator;
import com.cbp7.common.exception.ForbiddenException;
import com.cbp7.common.exception.ProfileIncompleteException;
import com.cbp7.common.exception.RegistrationAlreadyExistsException;
import com.cbp7.common.exception.UnauthorizedException;
import com.cbp7.identity.profile.entity.ProfileCompletion;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class CbpRegistrationValidatorTest {

    private CbpRegistrationValidator validator;

    @BeforeEach
    void setUp() {
        validator = new CbpRegistrationValidator();
    }

    @Test
    void validateStudentRole_NullUser_ThrowsUnauthorized() {
        assertThrows(UnauthorizedException.class, () -> validator.validateStudentRole(null));
    }

    @Test
    void validateStudentRole_AdminRole_ThrowsForbidden() {
        User user = User.builder().role(Role.ROLE_ADMIN).build();
        assertThrows(ForbiddenException.class, () -> validator.validateStudentRole(user));
    }

    @Test
    void validateRegistrationPreconditions_AlreadyExists_ThrowsRegistrationAlreadyExists() {
        ProfileCompletion completion = ProfileCompletion.builder().profileCompleted(true).build();
        assertThrows(RegistrationAlreadyExistsException.class, () -> validator.validateRegistrationPreconditions(true, completion));
    }

    @Test
    void validateRegistrationPreconditions_IncompleteProfile_ThrowsProfileIncomplete() {
        ProfileCompletion completion = ProfileCompletion.builder().profileCompleted(false).build();
        assertThrows(ProfileIncompleteException.class, () -> validator.validateRegistrationPreconditions(false, completion));
        assertThrows(ProfileIncompleteException.class, () -> validator.validateRegistrationPreconditions(false, null));
    }

    @Test
    void validateRegistrationPreconditions_Valid_Success() {
        ProfileCompletion completion = ProfileCompletion.builder().profileCompleted(true).build();
        assertDoesNotThrow(() -> validator.validateRegistrationPreconditions(false, completion));
    }
}
