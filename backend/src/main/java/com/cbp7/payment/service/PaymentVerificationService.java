package com.cbp7.payment.service;

import com.cbp7.cbp.entity.CbpRegistration;
import com.cbp7.cbp.enums.RegistrationStatus;
import com.cbp7.cbp.repository.CbpRegistrationRepository;
import com.cbp7.common.exception.ResourceNotFoundException;
import com.cbp7.payment.dto.PhonePeStatusResponse;
import com.cbp7.payment.entity.Payment;
import com.cbp7.payment.enums.PaymentStatus;
import com.cbp7.payment.gateway.PaymentGateway;
import com.cbp7.payment.repository.PaymentRepository;
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

    @Transactional
    public Payment verifyPaymentStatus(String transactionId) {
        Payment payment = paymentRepository.findByTransactionId(transactionId)
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
        boolean success = statusResponse.success();

        if ("PAYMENT_SUCCESS".equals(code) || "COMPLETED".equalsIgnoreCase(state)) {
            payment.setPaymentStatus(PaymentStatus.SUCCESS);

            // Update CBP registration state
            CbpRegistration registration = cbpRegistrationRepository.findById(payment.getRegistrationId())
                    .orElseThrow(() -> new ResourceNotFoundException("CBP registration not found for ID: " + payment.getRegistrationId()));
            registration.setRegistrationStatus(RegistrationStatus.REGISTERED);
            cbpRegistrationRepository.save(registration);
            
            log.info("Payment transaction {} verified successfully as SUCCESS.", transactionId);
        } else if ("FAILED".equalsIgnoreCase(state) || "PAYMENT_ERROR".equals(code)) {
            payment.setPaymentStatus(PaymentStatus.FAILED);
            log.info("Payment transaction {} verified as FAILED.", transactionId);
        } else {
            // Leave as PENDING
            log.info("Payment transaction {} is still PENDING at gateway.", transactionId);
        }

        return paymentRepository.save(payment);
    }
}
