package com.cbp7.auth;

import com.cbp7.auth.dto.request.LoginRequest;
import com.cbp7.auth.dto.request.RegisterRequest;
import com.cbp7.auth.entity.AuthProvider;
import com.cbp7.auth.entity.User;
import com.cbp7.auth.validation.AuthValidator;
import com.cbp7.common.exception.DuplicateResourceException;
import com.cbp7.common.exception.ForbiddenException;
import com.cbp7.common.exception.InvalidCredentialsException;
import com.cbp7.common.exception.UnauthorizedException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;

class AuthValidatorTest {

    private AuthValidator authValidator;
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        authValidator = new AuthValidator();
        passwordEncoder = new BCryptPasswordEncoder();
    }

    @Test
    void validateRegistration_NullRequest_ThrowsException() {
        assertThrows(IllegalArgumentException.class, () -> authValidator.validateRegistration(null, false, false));
    }

    @Test
    void validateRegistration_MissingFields_ThrowsException() {
        RegisterRequest req = new RegisterRequest("", "test@mnit.ac.in", "Test", "9876543210", "pass", "pass");
        assertThrows(IllegalArgumentException.class, () -> authValidator.validateRegistration(req, false, false));
    }

    @Test
    void validateRegistration_PasswordMismatch_ThrowsException() {
        RegisterRequest req = new RegisterRequest("2024test", "test@mnit.ac.in", "Test", "9876543210", "pass1", "pass2");
        assertThrows(IllegalArgumentException.class, () -> authValidator.validateRegistration(req, false, false));
    }

    @Test
    void validateRegistration_DuplicateStudentId_ThrowsException() {
        RegisterRequest req = new RegisterRequest("2024test", "test@mnit.ac.in", "Test", "9876543210", "pass", "pass");
        assertThrows(DuplicateResourceException.class, () -> authValidator.validateRegistration(req, true, false));
    }

    @Test
    void validateRegistration_DuplicateEmail_ThrowsException() {
        RegisterRequest req = new RegisterRequest("2024test", "test@mnit.ac.in", "Test", "9876543210", "pass", "pass");
        assertThrows(DuplicateResourceException.class, () -> authValidator.validateRegistration(req, false, true));
    }

    @Test
    void validateLoginRequest_NullOrBlank_ThrowsException() {
        assertThrows(IllegalArgumentException.class, () -> authValidator.validateLoginRequest(null));
        assertThrows(IllegalArgumentException.class, () -> authValidator.validateLoginRequest(new LoginRequest("", "pass")));
    }

    @Test
    void validateUserForLogin_GoogleAccount_ThrowsException() {
        User user = User.builder().authProvider(AuthProvider.GOOGLE).enabled(true).build();
        assertThrows(InvalidCredentialsException.class, () -> authValidator.validateUserForLogin(user, "pass", passwordEncoder));
    }

    @Test
    void validateUserForLogin_WrongPassword_ThrowsException() {
        User user = User.builder().password(passwordEncoder.encode("correct")).enabled(true).build();
        assertThrows(InvalidCredentialsException.class, () -> authValidator.validateUserForLogin(user, "wrong", passwordEncoder));
    }

    @Test
    void validateUserForLogin_DisabledAccount_ThrowsException() {
        User user = User.builder().password(passwordEncoder.encode("correct")).enabled(false).build();
        assertThrows(ForbiddenException.class, () -> authValidator.validateUserForLogin(user, "correct", passwordEncoder));
    }

    @Test
    void validateAuthenticatedUser_Null_ThrowsUnauthorizedException() {
        assertThrows(UnauthorizedException.class, () -> authValidator.validateAuthenticatedUser(null));
    }
}
