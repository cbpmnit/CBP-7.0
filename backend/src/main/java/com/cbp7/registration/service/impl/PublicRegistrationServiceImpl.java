package com.cbp7.registration.service.impl;

import com.cbp7.common.exception.DuplicateResourceException;
import com.cbp7.common.exception.ResourceNotFoundException;
import com.cbp7.payment.entity.Payment;
import com.cbp7.payment.entity.PaymentMode;
import com.cbp7.payment.entity.PaymentStatus;
import com.cbp7.payment.gateway.PaymentGateway;
import com.cbp7.registration.config.PublicRegistrationProperties;
import com.cbp7.registration.dto.request.CompletePublicRegistrationRequest;
import com.cbp7.registration.dto.request.CreatePublicOrderRequest;
import com.cbp7.registration.dto.request.PublicPaymentCallbackRequest;
import com.cbp7.registration.dto.response.PaymentConfigResponse;
import com.cbp7.registration.dto.response.PublicOrderResponse;
import com.cbp7.registration.dto.response.PublicRegistrationStatusResponse;
import com.cbp7.registration.entity.PublicPaymentTransaction;
import com.cbp7.registration.entity.PublicRegistration;
import com.cbp7.registration.enums.PublicPaymentStatus;
import com.cbp7.registration.enums.PublicRegistrationStatus;
import com.cbp7.registration.mapper.PublicRegistrationMapper;
import com.cbp7.registration.repository.PublicPaymentTransactionRepository;
import com.cbp7.registration.repository.PublicRegistrationRepository;
import com.cbp7.registration.service.PublicRegistrationService;
import com.cbp7.registration.validator.PublicRegistrationValidator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PublicRegistrationServiceImpl implements PublicRegistrationService {

    private final PublicRegistrationRepository publicRegistrationRepository;
    private final PublicPaymentTransactionRepository publicPaymentTransactionRepository;
    private final PublicRegistrationValidator publicRegistrationValidator;
    private final PublicRegistrationMapper publicRegistrationMapper;
    private final PublicRegistrationProperties publicRegistrationProperties;
    private final PaymentGateway paymentGateway;

    @Override
    public PaymentConfigResponse getPaymentConfig() {
        BigDecimal amount = publicRegistrationProperties.getAmount();
        String currency = publicRegistrationProperties.getCurrency();
        return new PaymentConfigResponse(amount, currency);
    }

    @Override
    @Transactional
    public PublicOrderResponse createOrder(CreatePublicOrderRequest request) {
        publicRegistrationValidator.validateCreateOrderRequest(request);

        String email = request.email().trim().toLowerCase();
        String studentId = request.studentId().trim().toUpperCase();

        if (publicRegistrationRepository.existsByEmailIgnoreCaseAndPaymentStatus(email, PublicRegistrationStatus.REGISTERED)) {
            throw new DuplicateResourceException("Registration already completed for email: " + email);
        }

        if (publicRegistrationRepository.existsByStudentIdIgnoreCaseAndPaymentStatus(studentId, PublicRegistrationStatus.REGISTERED)) {
            throw new DuplicateResourceException("Registration already completed for student ID: " + studentId);
        }

        PublicRegistration registration = publicRegistrationRepository.findByEmailIgnoreCase(email)
                .orElseGet(() -> publicRegistrationRepository.save(publicRegistrationMapper.toEntity(request)));

        return initiateOrderForRegistration(registration);
    }

    @Override
    @Transactional
    public PublicOrderResponse initiatePaymentOrder(UUID registrationId) {
        PublicRegistration registration = publicRegistrationRepository.findById(registrationId)
                .orElseThrow(() -> new ResourceNotFoundException("Public registration record not found with ID: " + registrationId));

        return initiateOrderForRegistration(registration);
    }

    private PublicOrderResponse initiateOrderForRegistration(PublicRegistration registration) {
        if (registration.getPaymentStatus() == PublicRegistrationStatus.REGISTERED) {
            log.info("[PUBLIC_PAYMENT] Registration {} is already completed and paid.", registration.getId());
            throw new DuplicateResourceException("Public registration has already been completed and paid.");
        }

        PublicPaymentTransaction existingTx = publicPaymentTransactionRepository.findByRegistrationId(registration.getId()).stream()
                .filter(tx -> tx.getStatus() == PublicPaymentStatus.INITIATED)
                .findFirst()
                .orElse(null);

        String merchantOrderId;
        BigDecimal configuredAmount = publicRegistrationProperties.getAmount();

        if (existingTx != null) {
            merchantOrderId = existingTx.getMerchantOrderId();
            log.info("[PUBLIC_PAYMENT] Reusing existing pending merchant order ID: {} for registration: {}",
                    merchantOrderId, registration.getId());
        } else {
            merchantOrderId = "PUB_ORD_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase();
            PublicPaymentTransaction transaction = PublicPaymentTransaction.builder()
                    .registration(registration)
                    .merchantOrderId(merchantOrderId)
                    .amount(configuredAmount)
                    .status(PublicPaymentStatus.INITIATED)
                    .build();

            publicPaymentTransactionRepository.save(transaction);
            log.info("[PUBLIC_PAYMENT] Created new merchant order ID: {} for registration: {}",
                    merchantOrderId, registration.getId());
        }

        Payment payment = Payment.builder()
                .transactionId(merchantOrderId)
                .registrationId(registration.getId())
                .amount(configuredAmount)
                .paymentStatus(PaymentStatus.PENDING)
                .paymentMode(PaymentMode.ONLINE)
                .build();

        String checkoutUrl;
        try {
            checkoutUrl = paymentGateway.initiatePayment(payment);
            log.info("[PUBLIC_PAYMENT] PhonePe checkout URL obtained for order {}: {}", merchantOrderId, checkoutUrl);
        } catch (Exception e) {
            log.warn("[PUBLIC_PAYMENT] PhonePe gateway initiation fallback for order {}: {}", merchantOrderId, e.getMessage());
            checkoutUrl = "/payment/status/" + merchantOrderId;
        }

        return new PublicOrderResponse(
                registration.getId(),
                merchantOrderId,
                configuredAmount,
                checkoutUrl,
                PublicPaymentStatus.INITIATED.name()
        );
    }

    @Override
    @Transactional
    public PublicRegistrationStatusResponse completeRegistration(CompletePublicRegistrationRequest request) {
        PublicRegistration registration = publicRegistrationRepository.findById(request.registrationId())
                .orElseThrow(() -> new ResourceNotFoundException("Public registration record not found"));

        PublicPaymentTransaction transaction = publicPaymentTransactionRepository.findByMerchantOrderId(request.merchantOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment transaction not found for order ID: " + request.merchantOrderId()));

        transaction.setStatus(PublicPaymentStatus.SUCCESS);
        if (request.gatewayTransactionId() != null) {
            transaction.setGatewayTransactionId(request.gatewayTransactionId());
        }
        publicPaymentTransactionRepository.save(transaction);

        registration.setPaymentStatus(PublicRegistrationStatus.REGISTERED);
        registration.setPaymentTransactionId(request.merchantOrderId());
        PublicRegistration saved = publicRegistrationRepository.save(registration);

        log.info("[PUBLIC_PAYMENT] Public registration completed successfully: registrationId={}, studentId={}", saved.getId(), saved.getStudentId());

        return publicRegistrationMapper.toStatusResponse(saved, transaction.getAmount());
    }

    @Override
    @Transactional
    public PublicRegistrationStatusResponse processPaymentCallback(PublicPaymentCallbackRequest request) {
        PublicPaymentTransaction transaction = publicPaymentTransactionRepository.findByMerchantOrderId(request.merchantOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment transaction not found for order ID: " + request.merchantOrderId()));

        PublicRegistration registration = transaction.getRegistration();

        boolean isSuccess = "SUCCESS".equalsIgnoreCase(request.status()) || "COMPLETED".equalsIgnoreCase(request.status());

        if (isSuccess) {
            transaction.setStatus(PublicPaymentStatus.SUCCESS);
            if (request.gatewayTransactionId() != null) {
                transaction.setGatewayTransactionId(request.gatewayTransactionId());
            }
            registration.setPaymentStatus(PublicRegistrationStatus.REGISTERED);
            registration.setPaymentTransactionId(request.merchantOrderId());
            log.info("[PUBLIC_PAYMENT] Payment transaction state transition: -> SUCCESS for order {}", request.merchantOrderId());
            log.info("[PUBLIC_PAYMENT] Registration state transition: -> REGISTERED for registration {}", registration.getId());
        } else {
            transaction.setStatus(PublicPaymentStatus.FAILED);
            registration.setPaymentStatus(PublicRegistrationStatus.FAILED);
            log.info("[PUBLIC_PAYMENT] Payment transaction state transition: -> FAILED for order {}", request.merchantOrderId());
        }

        publicPaymentTransactionRepository.save(transaction);
        PublicRegistration saved = publicRegistrationRepository.save(registration);

        return publicRegistrationMapper.toStatusResponse(saved, transaction.getAmount());
    }

    @Override
    @Transactional(readOnly = true)
    public PublicRegistrationStatusResponse getRegistrationStatus(UUID registrationId) {
        PublicRegistration registration = publicRegistrationRepository.findById(registrationId)
                .orElseThrow(() -> new ResourceNotFoundException("Registration not found with ID: " + registrationId));

        return publicRegistrationMapper.toStatusResponse(registration, publicRegistrationProperties.getAmount());
    }

    @Override
    @Transactional
    public PublicRegistrationStatusResponse getPaymentStatusByMerchantOrderId(String merchantOrderId) {
        PublicPaymentTransaction transaction = publicPaymentTransactionRepository.findByMerchantOrderId(merchantOrderId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment transaction not found for order ID: " + merchantOrderId));

        PublicRegistration registration = transaction.getRegistration();

        // Terminal check: if already REGISTERED / SUCCESS, return immediately
        if (transaction.getStatus() == PublicPaymentStatus.SUCCESS || registration.getPaymentStatus() == PublicRegistrationStatus.REGISTERED) {
            log.info("[PUBLIC_PAYMENT] Status query for order {}: Terminal status SUCCESS / REGISTERED.", merchantOrderId);
            return publicRegistrationMapper.toStatusResponse(registration, transaction.getAmount());
        }

        // On-demand gateway status reconciliation if INITIATED
        if (transaction.getStatus() == PublicPaymentStatus.INITIATED) {
            log.info("[PUBLIC_PAYMENT] Reconciling PhonePe gateway status for merchant order: {}", merchantOrderId);
            try {
                com.cbp7.payment.dto.response.PhonePeStatusResponse statusResponse = paymentGateway.checkPaymentStatus(merchantOrderId);
                log.info("[PUBLIC_PAYMENT] PhonePe gateway response for {}: state={}, success={}",
                        merchantOrderId, statusResponse.state(), statusResponse.success());

                if (statusResponse.success() || "COMPLETED".equalsIgnoreCase(statusResponse.state())) {
                    transaction.setStatus(PublicPaymentStatus.SUCCESS);
                    registration.setPaymentStatus(PublicRegistrationStatus.REGISTERED);
                    registration.setPaymentTransactionId(merchantOrderId);

                    publicPaymentTransactionRepository.save(transaction);
                    registration = publicRegistrationRepository.save(registration);
                    log.info("[PUBLIC_PAYMENT] Reconciled state: PENDING -> SUCCESS for order {}", merchantOrderId);
                } else if ("FAILED".equalsIgnoreCase(statusResponse.state()) || "EXPIRED".equalsIgnoreCase(statusResponse.state())) {
                    transaction.setStatus(PublicPaymentStatus.FAILED);
                    registration.setPaymentStatus(PublicRegistrationStatus.FAILED);

                    publicPaymentTransactionRepository.save(transaction);
                    registration = publicRegistrationRepository.save(registration);
                    log.info("[PUBLIC_PAYMENT] Reconciled state: PENDING -> FAILED for order {}", merchantOrderId);
                }
            } catch (Exception e) {
                log.warn("[PUBLIC_PAYMENT] PhonePe gateway status check for order {} encountered error: {}", merchantOrderId, e.getMessage());
            }
        }

        return publicRegistrationMapper.toStatusResponse(registration, transaction.getAmount());
    }
}
