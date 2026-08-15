package com.cbp7.registration.service.impl;

import com.cbp7.common.exception.DuplicateResourceException;
import com.cbp7.common.exception.ResourceNotFoundException;
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
            throw new DuplicateResourceException("Public registration has already been completed and paid.");
        }

        String merchantOrderId = "PUB_ORD_" + UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase();
        BigDecimal configuredAmount = publicRegistrationProperties.getAmount();

        PublicPaymentTransaction transaction = PublicPaymentTransaction.builder()
                .registration(registration)
                .merchantOrderId(merchantOrderId)
                .amount(configuredAmount)
                .status(PublicPaymentStatus.INITIATED)
                .build();

        publicPaymentTransactionRepository.save(transaction);

        String redirectUrl = "/payment/status/" + merchantOrderId;

        log.info("Public payment order initiated: registrationId={}, merchantOrderId={}, amount={}",
                registration.getId(), merchantOrderId, configuredAmount);

        return new PublicOrderResponse(
                registration.getId(),
                merchantOrderId,
                configuredAmount,
                redirectUrl,
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

        log.info("Public registration completed successfully: registrationId={}, studentId={}", saved.getId(), saved.getStudentId());

        return publicRegistrationMapper.toStatusResponse(saved);
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
        } else {
            transaction.setStatus(PublicPaymentStatus.FAILED);
            registration.setPaymentStatus(PublicRegistrationStatus.FAILED);
        }

        publicPaymentTransactionRepository.save(transaction);
        PublicRegistration saved = publicRegistrationRepository.save(registration);

        log.info("Processed payment callback for order {}: status={}, registrationStatus={}",
                request.merchantOrderId(), transaction.getStatus(), registration.getPaymentStatus());

        return publicRegistrationMapper.toStatusResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PublicRegistrationStatusResponse getRegistrationStatus(UUID registrationId) {
        PublicRegistration registration = publicRegistrationRepository.findById(registrationId)
                .orElseThrow(() -> new ResourceNotFoundException("Registration not found with ID: " + registrationId));

        return publicRegistrationMapper.toStatusResponse(registration);
    }
}
