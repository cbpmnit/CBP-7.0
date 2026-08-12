package com.cbp7.program.registration;

import com.cbp7.identity.auth.entity.Role;
import com.cbp7.identity.auth.entity.User;
import com.cbp7.common.exception.ForbiddenException;
import com.cbp7.common.exception.ProfileIncompleteException;
import com.cbp7.common.exception.RegistrationAlreadyExistsException;
import com.cbp7.common.exception.UnauthorizedException;
import com.cbp7.identity.profile.ProfileEligibilityValidator;
import com.cbp7.identity.profile.entity.Branch;
import com.cbp7.identity.profile.entity.Course;
import com.cbp7.identity.profile.entity.Gender;
import com.cbp7.identity.profile.entity.UserProfile;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.junit.jupiter.api.Assertions.*;

class CbpRegistrationValidatorTest {

    private CbpRegistrationValidator validator;

    @BeforeEach
    void setUp() {
        validator = new CbpRegistrationValidator(new ProfileEligibilityValidator());
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
        UserProfile profile = buildCompleteProfile();
        assertThrows(RegistrationAlreadyExistsException.class, () -> validator.validateRegistrationPreconditions(true, profile));
    }

    @Test
    void validateRegistrationPreconditions_IncompleteProfile_ThrowsProfileIncomplete() {
        UserProfile incomplete = UserProfile.builder().firstName("Parv").build();
        assertThrows(ProfileIncompleteException.class, () -> validator.validateRegistrationPreconditions(false, incomplete));
        assertThrows(ProfileIncompleteException.class, () -> validator.validateRegistrationPreconditions(false, null));
    }

    @Test
    void validateRegistrationPreconditions_Valid_Success() {
        UserProfile profile = buildCompleteProfile();
        assertDoesNotThrow(() -> validator.validateRegistrationPreconditions(false, profile));
    }

    private UserProfile buildCompleteProfile() {
        return UserProfile.builder()
                .firstName("Parv")
                .lastName("Agrawal")
                .gender(Gender.MALE)
                .dateOfBirth(LocalDate.of(2002, 5, 15))
                .phoneNumber("9876543210")
                .institute("MNIT Jaipur")
                .course(Course.BTECH)
                .branch(Branch.COMPUTER_SCIENCE_ENGINEERING)
                .year(3)
                .hosteller(false)
                .build();
    }
}
