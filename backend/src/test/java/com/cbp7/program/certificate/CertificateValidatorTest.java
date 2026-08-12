package com.cbp7.program.certificate;

import com.cbp7.identity.auth.entity.Role;
import com.cbp7.identity.auth.entity.User;
import com.cbp7.program.certificate.CertificateValidator;
import com.cbp7.common.exception.ForbiddenException;
import com.cbp7.common.exception.UnauthorizedException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class CertificateValidatorTest {

    private CertificateValidator validator;

    @BeforeEach
    void setUp() {
        validator = new CertificateValidator();
    }

    @Test
    void validateStudentRole_NullUser_ThrowsUnauthorized() {
        assertThrows(UnauthorizedException.class, () -> validator.validateStudentRole(null));
    }

    @Test
    void validateStudentRole_NonStudent_ThrowsForbidden() {
        User user = User.builder().role(Role.ROLE_VOLUNTEER).build();
        assertThrows(ForbiddenException.class, () -> validator.validateStudentRole(user));
    }

    @Test
    void validateEligibility_IncompleteRegistration_ThrowsIllegalState() {
        assertThrows(IllegalStateException.class, () -> validator.validateEligibility(false, true, 80.0, 75.0));
    }

    @Test
    void validateEligibility_Unpaid_ThrowsIllegalState() {
        assertThrows(IllegalStateException.class, () -> validator.validateEligibility(true, false, 80.0, 75.0));
    }

    @Test
    void validateEligibility_LowAttendance_ThrowsIllegalState() {
        assertThrows(IllegalStateException.class, () -> validator.validateEligibility(true, true, 70.0, 75.0));
    }

    @Test
    void validateEligibility_AllMet_Success() {
        assertDoesNotThrow(() -> validator.validateEligibility(true, true, 80.0, 75.0));
    }
}
