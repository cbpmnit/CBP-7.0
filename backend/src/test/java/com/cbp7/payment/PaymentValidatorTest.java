package com.cbp7.payment;

import com.cbp7.auth.entity.Role;
import com.cbp7.auth.entity.User;
import com.cbp7.common.exception.ForbiddenException;
import com.cbp7.common.exception.PaymentAlreadyExistsException;
import com.cbp7.common.exception.PhonePeBadRequestException;
import com.cbp7.common.exception.UnauthorizedException;
import com.cbp7.payment.entity.Payment;
import com.cbp7.payment.enums.PaymentStatus;
import com.cbp7.payment.validation.PaymentValidator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

class PaymentValidatorTest {

    private PaymentValidator validator;

    @BeforeEach
    void setUp() {
        validator = new PaymentValidator();
    }

    @Test
    void validateStudentRole_NullUser_ThrowsUnauthorized() {
        assertThrows(UnauthorizedException.class, () -> validator.validateStudentRole(null));
    }

    @Test
    void validateStudentRole_VolunteerRole_ThrowsForbidden() {
        User user = User.builder().role(Role.ROLE_VOLUNTEER).build();
        assertThrows(ForbiddenException.class, () -> validator.validateStudentRole(user));
    }

    @Test
    void validateNoSuccessfulPayment_HasSuccess_ThrowsPaymentAlreadyExists() {
        assertThrows(PaymentAlreadyExistsException.class, () -> validator.validateNoSuccessfulPayment(true));
        assertDoesNotThrow(() -> validator.validateNoSuccessfulPayment(false));
    }

    @Test
    void validatePaymentOwnership_MismatchedUser_ThrowsForbidden() {
        UUID uid1 = UUID.randomUUID();
        UUID uid2 = UUID.randomUUID();
        Payment payment = Payment.builder().userId(uid1).build();
        User user = User.builder().build();
        user.setId(uid2);

        assertThrows(ForbiddenException.class, () -> validator.validatePaymentOwnership(payment, user));
    }

    @Test
    void validateCallbackHeaders_MissingHeaders_ThrowsPhonePeBadRequest() {
        assertThrows(PhonePeBadRequestException.class, () -> validator.validateCallbackHeaders(null, "payload"));
        assertThrows(PhonePeBadRequestException.class, () -> validator.validateCallbackHeaders("auth", ""));
    }

    @Test
    void isValidStateTransition_SuccessToFailed_ReturnsFalse() {
        assertFalse(validator.isValidStateTransition(PaymentStatus.SUCCESS, PaymentStatus.FAILED, "TXN_123"));
        assertFalse(validator.isValidStateTransition(PaymentStatus.REFUNDED, PaymentStatus.SUCCESS, "TXN_123"));
        assertTrue(validator.isValidStateTransition(PaymentStatus.PENDING, PaymentStatus.SUCCESS, "TXN_123"));
    }
}
