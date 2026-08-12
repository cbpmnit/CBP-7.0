package com.cbp7.payment.service.impl;

import com.cbp7.identity.auth.entity.User;
import com.cbp7.identity.auth.repository.UserRepository;
import com.cbp7.program.registration.entity.CbpRegistration;
import com.cbp7.program.registration.entity.RegistrationStatus;
import com.cbp7.program.registration.repository.CbpRegistrationRepository;
import com.cbp7.common.exception.PhonePeBadRequestException;
import com.cbp7.common.exception.ResourceNotFoundException;
import com.cbp7.platform.notification.events.NotificationEventPublisher;
import com.cbp7.platform.notification.events.PaymentSuccessfulEvent;
import com.cbp7.payment.dto.response.PhonePeStatusResponse;
import com.cbp7.payment.entity.Payment;
import com.cbp7.payment.entity.PaymentStatus;
import com.cbp7.payment.gateway.PaymentGateway;
import com.cbp7.payment.repository.PaymentRepository;
import com.cbp7.payment.service.PaymentVerificationService;
import com.cbp7.payment.PaymentValidator;
import com.phonepe.sdk.pg.common.models.response.CallbackResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentVerificationServiceImpl implements PaymentVerificationService {

    private final PaymentRepository paymentRepository;
    private final CbpRegistrationRepository cbpRegistrationRepository;
    private final PaymentGateway paymentGateway;
    private final UserRepository userRepository;
    private final NotificationEventPublisher notificationEventPublisher;
    private final PaymentValidator paymentValidator;

    @Override
    @Transactional
    public Payment verifyPaymentStatus(String transactionId) {
        Payment payment = fetchLockedPayment(transactionId);

        if (payment.getPaymentStatus() == PaymentStatus.SUCCESS) {
            log.info("Payment for transaction {} is already SUCCESS. Skipping gateway query.", transactionId);
            return payment;
        }

        PhonePeStatusResponse statusResponse = paymentGateway.checkPaymentStatus(transactionId);
        PaymentStatus resolvedStatus = resolveStatusFromGateway(statusResponse);

        if (resolvedStatus != null) {
            updatePaymentStatus(payment, resolvedStatus);
            log.info("Payment transaction {} verified as {}.", transactionId, resolvedStatus);
        } else {
            log.info("Payment transaction {} remains PENDING at gateway.", transactionId);
        }

        return payment;
    }

    @Override
    @Transactional
    public void updatePaymentStatus(Payment payment, PaymentStatus newStatus) {
        PaymentStatus currentStatus = payment.getPaymentStatus();
        if (!paymentValidator.isValidStateTransition(currentStatus, newStatus, payment.getTransactionId())) {
            return;
        }

        log.info("PHONEPE_PAYMENT_UPDATED\noldStatus={}\nnewStatus={}", currentStatus, newStatus);
        log.info("Updating payment transaction {} status from {} to {}", payment.getTransactionId(), currentStatus, newStatus);

        if (newStatus == PaymentStatus.SUCCESS) {
            completeSuccessfulPayment(payment);
        } else {
            payment.setPaymentStatus(newStatus);
            paymentRepository.save(payment);
        }
    }

    @Override
    @Transactional
    public void completeSuccessfulPayment(Payment payment) {
        if (payment.getPaymentStatus() == PaymentStatus.SUCCESS) {
            return;
        }
        payment.setPaymentStatus(PaymentStatus.SUCCESS);
        paymentRepository.save(payment);

        markRegistrationAsRegistered(payment.getRegistrationId());
        publishPaymentSuccessEvent(payment);
    }

    @Override
    @Transactional
    public void processCallback(String authorization, String rawRequestBody) {
        paymentValidator.validateCallbackHeaders(authorization, rawRequestBody);

        CallbackResponse callbackResponse = paymentGateway.validateCallback(authorization, rawRequestBody);
        validateCallbackPayload(callbackResponse);

        String merchantOrderId = callbackResponse.getPayload().getOrderId();
        String state = callbackResponse.getPayload().getState();

        log.info("PHONEPE_WEBHOOK_RECEIVED\ntransactionId={}\nstate={}", merchantOrderId, state);
        log.info("Processing callback for Order ID: {}, State: {}", merchantOrderId, state);

        Payment payment = fetchLockedPayment(merchantOrderId);
        PaymentStatus newStatus = mapCallbackStateToPaymentStatus(state);
        updatePaymentStatus(payment, newStatus);
    }

    // --- Private Story Helper Methods ---

    private Payment fetchLockedPayment(String transactionId) {
        return paymentRepository.findByTransactionIdWithLock(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found for transaction: " + transactionId));
    }

    private PaymentStatus resolveStatusFromGateway(PhonePeStatusResponse statusResponse) {
        String code = statusResponse.code();
        String state = statusResponse.state();

        if ("PAYMENT_SUCCESS".equals(code) || "COMPLETED".equalsIgnoreCase(state)) {
            return PaymentStatus.SUCCESS;
        }
        if ("FAILED".equalsIgnoreCase(state) || "PAYMENT_ERROR".equals(code)) {
            return PaymentStatus.FAILED;
        }
        return null;
    }

    private PaymentStatus mapCallbackStateToPaymentStatus(String state) {
        if ("COMPLETED".equalsIgnoreCase(state)) {
            return PaymentStatus.SUCCESS;
        }
        if ("FAILED".equalsIgnoreCase(state)) {
            return PaymentStatus.FAILED;
        }
        return PaymentStatus.PENDING;
    }

    private void validateCallbackPayload(CallbackResponse callbackResponse) {
        if (callbackResponse == null || callbackResponse.getPayload() == null) {
            throw new PhonePeBadRequestException("Invalid callback payload");
        }
    }

    private void markRegistrationAsRegistered(java.util.UUID registrationId) {
        CbpRegistration registration = cbpRegistrationRepository.findById(registrationId)
                .orElseThrow(() -> new ResourceNotFoundException("CBP registration not found for ID: " + registrationId));
        registration.setRegistrationStatus(RegistrationStatus.REGISTERED);
        cbpRegistrationRepository.save(registration);
    }

    private void publishPaymentSuccessEvent(Payment payment) {
        try {
            User user = userRepository.findById(payment.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found for ID: " + payment.getUserId()));

            PaymentSuccessfulEvent event = new PaymentSuccessfulEvent(
                    user.getStudentId(),
                    user.getEmail(),
                    user.getName(),
                    payment.getId().toString(),
                    payment.getAmount().toString()
            );
            notificationEventPublisher.publish(event);
            log.info("Published PaymentSuccessfulEvent for payment transaction: {}", payment.getTransactionId());
        } catch (Exception e) {
            log.error("Failed to publish PaymentSuccessfulEvent for payment transaction {}: {}", payment.getTransactionId(), e.getMessage());
        }
    }
}
