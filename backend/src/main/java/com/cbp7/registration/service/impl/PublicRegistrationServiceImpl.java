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
import com.cbp7.registration.enums.PublicRegistrationAuditEventType;
import com.cbp7.registration.mapper.PublicRegistrationMapper;
import com.cbp7.registration.repository.PublicPaymentTransactionRepository;
import com.cbp7.registration.repository.PublicRegistrationRepository;
import com.cbp7.registration.service.PublicRegistrationAuditService;
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
    private final PublicRegistrationAuditService auditService;

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
            auditService.logEvent(null, null, null, PublicRegistrationAuditEventType.DUPLICATE_REQUEST, "Duplicate registration request for email: " + email);
            throw new DuplicateResourceException("Registration already completed for email: " + email);
        }

        if (publicRegistrationRepository.existsByStudentIdIgnoreCaseAndPaymentStatus(studentId, PublicRegistrationStatus.REGISTERED)) {
            auditService.logEvent(null, null, null, PublicRegistrationAuditEventType.DUPLICATE_REQUEST, "Duplicate registration request for student ID: " + studentId);
            throw new DuplicateResourceException("Registration already completed for student ID: " + studentId);
        }

        PublicRegistration registration = publicRegistrationRepository.findByEmailIgnoreCase(email)
                .orElseGet(() -> {
                    PublicRegistration saved = publicRegistrationRepository.save(publicRegistrationMapper.toEntity(request));
                    auditService.logEvent(saved.getId(), null, null, PublicRegistrationAuditEventType.REGISTRATION_CREATED, "Public registration created");
                    return saved;
                });

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
            auditService.logEvent(registration.getId(), null, null, PublicRegistrationAuditEventType.DUPLICATE_REQUEST, "Registration already completed and paid");
            throw new DuplicateResourceException("Public registration has already been completed and paid.");
        }

        PublicPaymentTransaction existingTx = publicPaymentTransactionRepository.findByRegistrationId(registration.getId()).stream()
                .filter(tx -> tx.getStatus() == PublicPaymentStatus.INITIATED)
                .findFirst()
                .orElse(null);

        String merchantOrderId;
        BigDecimal configuredAmount = publicRegistrationProperties.getAmount();
        PublicPaymentTransaction transaction;

        if (existingTx != null) {
            merchantOrderId = existingTx.getMerchantOrderId();
            transaction = existingTx;
            auditService.logEvent(registration.getId(), transaction.getId(), merchantOrderId, PublicRegistrationAuditEventType.DUPLICATE_REQUEST, "Reusing existing pending merchant order ID: " + merchantOrderId);
        } else {
            merchantOrderId = "PUB_ORD_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase();
            PublicPaymentTransaction newTx = PublicPaymentTransaction.builder()
                    .registration(registration)
                    .merchantOrderId(merchantOrderId)
                    .amount(configuredAmount)
                    .status(PublicPaymentStatus.INITIATED)
                    .build();

            PublicPaymentTransaction savedTx = publicPaymentTransactionRepository.save(newTx);
            transaction = savedTx != null ? savedTx : newTx;
            UUID txId = transaction != null ? transaction.getId() : null;
            auditService.logEvent(registration.getId(), txId, merchantOrderId, PublicRegistrationAuditEventType.PAYMENT_ORDER_CREATED, "Payment order created successfully");
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
            auditService.logEvent(registration.getId(), transaction.getId(), merchantOrderId, PublicRegistrationAuditEventType.PAYMENT_REDIRECTED, "User redirected to payment gateway");
        } catch (Exception e) {
            auditService.logEvent(registration.getId(), transaction.getId(), merchantOrderId, PublicRegistrationAuditEventType.PAYMENT_ERROR, "Payment initiation gateway error: " + e.getMessage());
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
        registration.setAccountVerified(true);
        PublicRegistration saved = publicRegistrationRepository.save(registration);

        auditService.logEvent(saved.getId(), transaction.getId(), request.merchantOrderId(), PublicRegistrationAuditEventType.PAYMENT_SUCCESS, "Payment verified successfully");
        auditService.logEvent(saved.getId(), transaction.getId(), request.merchantOrderId(), PublicRegistrationAuditEventType.REGISTRATION_COMPLETED, "Public registration marked as registered");
        auditService.logEvent(saved.getId(), transaction.getId(), request.merchantOrderId(), PublicRegistrationAuditEventType.ACCOUNT_VERIFIED, "accountVerified changed to TRUE");

        return publicRegistrationMapper.toStatusResponse(saved, transaction.getAmount());
    }

    @Override
    @Transactional
    public PublicRegistrationStatusResponse processPaymentCallback(PublicPaymentCallbackRequest request) {
        PublicPaymentTransaction transaction = publicPaymentTransactionRepository.findByMerchantOrderId(request.merchantOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment transaction not found for order ID: " + request.merchantOrderId()));

        PublicRegistration registration = transaction.getRegistration();

        auditService.logEvent(registration.getId(), transaction.getId(), request.merchantOrderId(), PublicRegistrationAuditEventType.PAYMENT_CALLBACK_RECEIVED, "Payment gateway callback received");

        boolean isSuccess = "SUCCESS".equalsIgnoreCase(request.status()) || "COMPLETED".equalsIgnoreCase(request.status());

        if (isSuccess) {
            transaction.setStatus(PublicPaymentStatus.SUCCESS);
            if (request.gatewayTransactionId() != null) {
                transaction.setGatewayTransactionId(request.gatewayTransactionId());
            }
            registration.setPaymentStatus(PublicRegistrationStatus.REGISTERED);
            registration.setPaymentTransactionId(request.merchantOrderId());
            registration.setAccountVerified(true);

            auditService.logEvent(registration.getId(), transaction.getId(), request.merchantOrderId(), PublicRegistrationAuditEventType.PAYMENT_SUCCESS, "Payment verified successfully");
            auditService.logEvent(registration.getId(), transaction.getId(), request.merchantOrderId(), PublicRegistrationAuditEventType.REGISTRATION_COMPLETED, "Public registration marked as registered");
            auditService.logEvent(registration.getId(), transaction.getId(), request.merchantOrderId(), PublicRegistrationAuditEventType.ACCOUNT_VERIFIED, "accountVerified changed to TRUE");
        } else {
            transaction.setStatus(PublicPaymentStatus.FAILED);
            registration.setPaymentStatus(PublicRegistrationStatus.FAILED);

            auditService.logEvent(registration.getId(), transaction.getId(), request.merchantOrderId(), PublicRegistrationAuditEventType.PAYMENT_FAILED, "Payment processing failed");
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

        if (transaction.getStatus() == PublicPaymentStatus.SUCCESS || registration.getPaymentStatus() == PublicRegistrationStatus.REGISTERED) {
            return publicRegistrationMapper.toStatusResponse(registration, transaction.getAmount());
        }

        if (transaction.getStatus() == PublicPaymentStatus.INITIATED) {
            auditService.logEvent(registration.getId(), transaction.getId(), merchantOrderId, PublicRegistrationAuditEventType.PAYMENT_STATUS_CHECKED, "Payment status reconciled with gateway");
            try {
                com.cbp7.payment.dto.response.PhonePeStatusResponse statusResponse = paymentGateway.checkPaymentStatus(merchantOrderId);

                if (statusResponse.success() || "COMPLETED".equalsIgnoreCase(statusResponse.state())) {
                    transaction.setStatus(PublicPaymentStatus.SUCCESS);
                    registration.setPaymentStatus(PublicRegistrationStatus.REGISTERED);
                    registration.setPaymentTransactionId(merchantOrderId);
                    registration.setAccountVerified(true);

                    publicPaymentTransactionRepository.save(transaction);
                    registration = publicRegistrationRepository.save(registration);

                    auditService.logEvent(registration.getId(), transaction.getId(), merchantOrderId, PublicRegistrationAuditEventType.PAYMENT_SUCCESS, "Payment verified successfully");
                    auditService.logEvent(registration.getId(), transaction.getId(), merchantOrderId, PublicRegistrationAuditEventType.REGISTRATION_COMPLETED, "Public registration marked as registered");
                    auditService.logEvent(registration.getId(), transaction.getId(), merchantOrderId, PublicRegistrationAuditEventType.ACCOUNT_VERIFIED, "accountVerified changed to TRUE");
                } else if ("FAILED".equalsIgnoreCase(statusResponse.state()) || "EXPIRED".equalsIgnoreCase(statusResponse.state())) {
                    transaction.setStatus(PublicPaymentStatus.FAILED);
                    registration.setPaymentStatus(PublicRegistrationStatus.FAILED);

                    publicPaymentTransactionRepository.save(transaction);
                    registration = publicRegistrationRepository.save(registration);

                    auditService.logEvent(registration.getId(), transaction.getId(), merchantOrderId, PublicRegistrationAuditEventType.PAYMENT_FAILED, "Payment processing failed");
                }
            } catch (Exception e) {
                log.warn("[PUBLIC_REGISTRATION] PhonePe gateway status check for order {} encountered error: {}", merchantOrderId, e.getMessage());
            }
        }

        return publicRegistrationMapper.toStatusResponse(registration, transaction.getAmount());
    }
}
