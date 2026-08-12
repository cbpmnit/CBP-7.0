package com.cbp7.payment;

import com.cbp7.identity.auth.entity.Role;
import com.cbp7.identity.auth.entity.User;
import com.cbp7.common.exception.ForbiddenException;
import com.cbp7.common.exception.PaymentAlreadyExistsException;
import com.cbp7.common.exception.PhonePeBadRequestException;
import com.cbp7.common.exception.UnauthorizedException;
import com.cbp7.payment.entity.Payment;
import com.cbp7.payment.entity.PaymentStatus;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class PaymentValidator {

    public void validateStudentRole(User user) {
        if (user == null) {
            throw new UnauthorizedException("User is not authenticated.");
        }
        if (user.getRole() != Role.ROLE_STUDENT) {
            throw new ForbiddenException("Only students can perform payment actions.");
        }
    }

    public void validateNoSuccessfulPayment(boolean hasSuccessfulPayment) {
        if (hasSuccessfulPayment) {
            throw new PaymentAlreadyExistsException("Payment already completed.");
        }
    }

    public void validatePaymentOwnership(Payment payment, User user) {
        if (payment == null || user == null || !payment.getUserId().equals(user.getId())) {
            throw new ForbiddenException("You are not authorized to view this payment status.");
        }
    }

    public void validateCallbackHeaders(String authorization, String rawRequestBody) {
        if (authorization == null || authorization.isBlank()) {
            throw new PhonePeBadRequestException("Missing Authorization header");
        }
        if (rawRequestBody == null || rawRequestBody.isBlank()) {
            throw new PhonePeBadRequestException("Missing callback payload");
        }
    }

    public boolean isValidStateTransition(PaymentStatus currentStatus, PaymentStatus newStatus, String transactionId) {
        if (currentStatus == newStatus) {
            return false;
        }

        if (currentStatus == PaymentStatus.SUCCESS && newStatus != PaymentStatus.REFUNDED) {
            log.warn("Attempt to downgrade payment transaction {} from SUCCESS to {}", transactionId, newStatus);
            return false;
        }

        if (currentStatus == PaymentStatus.REFUNDED) {
            log.warn("Attempt to transition payment transaction {} from REFUNDED to {}", transactionId, newStatus);
            return false;
        }

        return true;
    }
}
