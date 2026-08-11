package com.cbp7.payment.service;

import com.cbp7.auth.entity.User;
import com.cbp7.auth.repository.UserRepository;
import com.cbp7.cbp.entity.CbpRegistration;
import com.cbp7.cbp.enums.RegistrationStatus;
import com.cbp7.cbp.repository.CbpRegistrationRepository;
import com.cbp7.common.exception.PhonePeBadRequestException;
import com.cbp7.common.exception.ResourceNotFoundException;
import com.cbp7.notification.event.NotificationEventPublisher;
import com.cbp7.notification.event.PaymentSuccessfulEvent;
import com.cbp7.payment.config.PhonePeConfig;
import com.cbp7.payment.dto.PhonePeStatusResponse;
import com.cbp7.payment.entity.Payment;
import com.cbp7.payment.enums.PaymentStatus;
import com.cbp7.payment.gateway.PaymentGateway;
import com.cbp7.payment.repository.PaymentRepository;
import com.phonepe.sdk.pg.payments.v2.StandardCheckoutClient;
import com.phonepe.sdk.pg.common.models.response.CallbackResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentVerificationService {

    private final PaymentRepository paymentRepository;
    private final CbpRegistrationRepository cbpRegistrationRepository;
    private final PaymentGateway paymentGateway;
    private final StandardCheckoutClient standardCheckoutClient;
    private final PhonePeConfig phonePeConfig;
    private final UserRepository userRepository;
    private final NotificationEventPublisher notificationEventPublisher;

    @Transactional
    public Payment verifyPaymentStatus(String transactionId) {
        Payment payment = paymentRepository.findByTransactionIdWithLock(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found for transaction: " + transactionId));

        // Idempotency: If already SUCCESS, do not query the gateway or downgrade
        if (payment.getPaymentStatus() == PaymentStatus.SUCCESS) {
            log.info("Payment for transaction {} is already SUCCESS. Skipping gateway query.", transactionId);
            return payment;
        }

        // Query PhonePe status API
        PhonePeStatusResponse statusResponse = paymentGateway.checkPaymentStatus(transactionId);

        // Update status based on response
        String code = statusResponse.code();
        String state = statusResponse.state();

        if ("PAYMENT_SUCCESS".equals(code) || "COMPLETED".equalsIgnoreCase(state)) {
            updatePaymentStatus(payment, PaymentStatus.SUCCESS);
            log.info("Payment transaction {} verified successfully as SUCCESS.", transactionId);
        } else if ("FAILED".equalsIgnoreCase(state) || "PAYMENT_ERROR".equals(code)) {
            updatePaymentStatus(payment, PaymentStatus.FAILED);
            log.info("Payment transaction {} verified as FAILED.", transactionId);
        } else {
            // Leave as PENDING
            log.info("Payment transaction {} is still PENDING at gateway.", transactionId);
        }

        return payment;
    }

    @Transactional
    public void updatePaymentStatus(Payment payment, PaymentStatus newStatus) {
        PaymentStatus currentStatus = payment.getPaymentStatus();
        if (currentStatus == newStatus) {
            return;
        }

        // Validate state transitions (Idempotency and safety checks)
        if (currentStatus == PaymentStatus.SUCCESS && newStatus != PaymentStatus.REFUNDED) {
            log.warn("Attempt to downgrade payment transaction {} from SUCCESS to {}", payment.getTransactionId(), newStatus);
            return;
        }
        if (currentStatus == PaymentStatus.REFUNDED) {
            log.warn("Attempt to transition payment transaction {} from REFUNDED to {}", payment.getTransactionId(), newStatus);
            return;
        }

        log.info("Updating payment transaction {} status from {} to {}", payment.getTransactionId(), currentStatus, newStatus);
        
        if (newStatus == PaymentStatus.SUCCESS) {
            completeSuccessfulPayment(payment);
        } else {
            payment.setPaymentStatus(newStatus);
            paymentRepository.save(payment);
        }
    }

    @Transactional
    public void completeSuccessfulPayment(Payment payment) {
        if (payment.getPaymentStatus() == PaymentStatus.SUCCESS) {
            return;
        }
        payment.setPaymentStatus(PaymentStatus.SUCCESS);
        paymentRepository.save(payment);

        // Update CBP registration state
        CbpRegistration registration = cbpRegistrationRepository.findById(payment.getRegistrationId())
                .orElseThrow(() -> new ResourceNotFoundException("CBP registration not found for ID: " + payment.getRegistrationId()));
        registration.setRegistrationStatus(RegistrationStatus.REGISTERED);
        cbpRegistrationRepository.save(registration);

        // Load User details to publish PaymentSuccessfulEvent
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

    @Transactional
    public void processCallback(String authorization, String rawRequestBody) {
        if (authorization == null || authorization.isBlank()) {
            throw new PhonePeBadRequestException("Missing Authorization header");
        }
        if (rawRequestBody == null || rawRequestBody.isBlank()) {
            throw new PhonePeBadRequestException("Missing callback payload");
        }

        // Validate request
        CallbackResponse callbackResponse;
        try {
            callbackResponse = standardCheckoutClient.validateCallback(
                    phonePeConfig.getCallbackUsername(),
                    phonePeConfig.getCallbackPassword(),
                    authorization,
                    rawRequestBody
            );
        } catch (com.phonepe.sdk.pg.common.exception.PhonePeException e) {
            log.error("PhonePe callback signature verification failed: {}", e.getMessage());
            throw new PhonePeBadRequestException("Invalid PhonePe callback signature");
        }

        if (callbackResponse == null || callbackResponse.getPayload() == null) {
            throw new PhonePeBadRequestException("Invalid callback payload");
        }

        String merchantOrderId = callbackResponse.getPayload().getOrderId();
        String state = callbackResponse.getPayload().getState();

        log.info("Processing callback for Order ID: {}, State: {}", merchantOrderId, state);

        // Find payment with pessimistic write lock to prevent concurrency race conditions
        Payment payment = paymentRepository.findByTransactionIdWithLock(merchantOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found for transaction: " + merchantOrderId));

        // Update status based on state
        if ("COMPLETED".equalsIgnoreCase(state)) {
            updatePaymentStatus(payment, PaymentStatus.SUCCESS);
            log.info("Payment transaction {} updated as SUCCESS via webhook callback.", merchantOrderId);
        } else if ("FAILED".equalsIgnoreCase(state)) {
            updatePaymentStatus(payment, PaymentStatus.FAILED);
            log.info("Payment transaction {} updated as FAILED via webhook callback.", merchantOrderId);
        } else {
            // Keep status PENDING
            updatePaymentStatus(payment, PaymentStatus.PENDING);
            log.info("Payment transaction {} remains PENDING via webhook callback.", merchantOrderId);
        }
    }
}
