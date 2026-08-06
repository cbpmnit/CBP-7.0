package com.cbp7.payment.service;

import com.cbp7.auth.entity.Role;
import com.cbp7.auth.entity.User;
import com.cbp7.cbp.entity.CbpRegistration;
import com.cbp7.cbp.repository.CbpRegistrationRepository;
import com.cbp7.common.exception.CbpRegistrationRequiredException;
import com.cbp7.common.exception.ForbiddenException;
import com.cbp7.common.exception.PaymentAlreadyExistsException;
import com.cbp7.common.exception.ResourceNotFoundException;
import com.cbp7.common.exception.UnauthorizedException;
import com.cbp7.payment.dto.CreatePaymentRequest;
import com.cbp7.payment.dto.PaymentDetailResponse;
import com.cbp7.payment.dto.PaymentResponse;
import com.cbp7.payment.dto.PhonePePaymentResponse;
import com.cbp7.payment.dto.PaymentStatusResponse;
import com.cbp7.payment.entity.Payment;
import com.cbp7.payment.enums.PaymentMode;
import com.cbp7.payment.enums.PaymentStatus;
import com.cbp7.payment.gateway.PaymentGateway;
import com.cbp7.payment.repository.PaymentRepository;
import com.cbp7.payment.config.PhonePeConfig;
import com.cbp7.payment.dto.PhonePeCallbackRequest;
import com.cbp7.payment.gateway.PhonePeChecksumUtil;
import com.cbp7.cbp.enums.RegistrationStatus;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    public static final BigDecimal CBP_REGISTRATION_FEE = new BigDecimal("500.00");

    private final PaymentRepository paymentRepository;
    private final CbpRegistrationRepository cbpRegistrationRepository;
    private final PaymentGateway paymentGateway;
    private final PhonePeConfig phonePeConfig;
    private final ObjectMapper objectMapper;
    private final PaymentVerificationService paymentVerificationService;

    @Transactional
    public PaymentResponse createPayment(User user, CreatePaymentRequest request) {
        validateStudentRole(user);

        // Find CBP registration of current user
        CbpRegistration registration = cbpRegistrationRepository.findByUserStudentIdIgnoreCase(user.getStudentId())
                .orElseThrow(() -> new CbpRegistrationRequiredException("Please complete CBP registration first."));

        // Check if successful payment already exists
        boolean hasSuccessfulPayment = paymentRepository.existsByRegistrationIdAndPaymentStatus(
                registration.getId(), PaymentStatus.SUCCESS
        );
        if (hasSuccessfulPayment) {
            throw new PaymentAlreadyExistsException("Payment already completed.");
        }

        // Create Payment record
        Payment payment = Payment.builder()
                .registrationId(registration.getId())
                .userId(user.getId())
                .paymentMode(request.paymentMode())
                .paymentStatus(PaymentStatus.PENDING)
                .amount(CBP_REGISTRATION_FEE)
                .build();

        Payment savedPayment = paymentRepository.save(payment);

        return new PaymentResponse(
                savedPayment.getId(),
                savedPayment.getPaymentMode(),
                savedPayment.getPaymentStatus(),
                savedPayment.getAmount()
        );
    }

    @Transactional
    public PhonePePaymentResponse initiatePhonePePayment(User user) {
        validateStudentRole(user);

        // Check CBP registration exists
        CbpRegistration registration = cbpRegistrationRepository.findByUserStudentIdIgnoreCase(user.getStudentId())
                .orElseThrow(() -> new CbpRegistrationRequiredException("Please complete CBP registration first."));

        // Check existing payments
        List<Payment> payments = paymentRepository.findByUserId(user.getId());
        
        boolean hasSuccessful = payments.stream().anyMatch(p -> p.getPaymentStatus() == PaymentStatus.SUCCESS);
        if (hasSuccessful) {
            throw new PaymentAlreadyExistsException("Payment already completed.");
        }

        // Reuse existing PENDING or FAILED payment, or create new one
        Payment payment = payments.stream()
                .filter(p -> p.getPaymentStatus() == PaymentStatus.PENDING || p.getPaymentStatus() == PaymentStatus.FAILED)
                .findFirst()
                .orElseGet(() -> {
                    Payment newPayment = Payment.builder()
                            .registrationId(registration.getId())
                            .userId(user.getId())
                            .paymentMode(PaymentMode.ONLINE)
                            .paymentStatus(PaymentStatus.PENDING)
                            .amount(CBP_REGISTRATION_FEE)
                            .build();
                    return paymentRepository.save(newPayment);
                });

        // Set/update to a new unique transaction ID for PhonePe
        String newTxnId = "CBP_TXN_" + UUID.randomUUID().toString().replace("-", "");
        payment.setTransactionId(newTxnId);
        payment.setPaymentMode(PaymentMode.ONLINE);
        payment.setPaymentStatus(PaymentStatus.PENDING);
        
        Payment savedPayment = paymentRepository.saveAndFlush(payment);

        // Call PhonePe gateway to initiate
        String redirectUrl = paymentGateway.initiatePayment(savedPayment);

        return new PhonePePaymentResponse(
                savedPayment.getId(),
                savedPayment.getTransactionId(),
                redirectUrl,
                savedPayment.getPaymentStatus()
        );
    }

    @Transactional(readOnly = true)
    public PaymentDetailResponse getMyPayment(User user) {
        validateStudentRole(user);

        List<Payment> payments = paymentRepository.findByUserId(user.getId());
        if (payments.isEmpty()) {
            throw new ResourceNotFoundException("No payment record found for current user.");
        }

        // Prioritize SUCCESS status, otherwise return the most recent attempt
        Payment payment = payments.stream()
                .filter(p -> p.getPaymentStatus() == PaymentStatus.SUCCESS)
                .findFirst()
                .orElseGet(() -> payments.stream()
                        .sorted((p1, p2) -> p2.getCreatedAt().compareTo(p1.getCreatedAt()))
                        .findFirst()
                        .orElseThrow(() -> new ResourceNotFoundException("No payment record found for current user.")));

        return new PaymentDetailResponse(
                payment.getId(),
                payment.getPaymentMode(),
                payment.getPaymentStatus(),
                payment.getAmount(),
                payment.getCreatedAt()
        );
    }

    @Transactional
    public PaymentStatusResponse verifyAndGetPaymentStatus(User user, String transactionId) {
        validateStudentRole(user);

        // Fetch payment to check ownership before verification
        Payment payment = paymentRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found for transaction: " + transactionId));

        if (!payment.getUserId().equals(user.getId())) {
            throw new ForbiddenException("You are not authorized to view this payment status.");
        }

        // Verify and update status via PaymentVerificationService
        Payment verifiedPayment = paymentVerificationService.verifyPaymentStatus(transactionId);

        return new PaymentStatusResponse(
                verifiedPayment.getTransactionId(),
                verifiedPayment.getPaymentStatus(),
                verifiedPayment.getAmount()
        );
    }

    private void validateStudentRole(User user) {
        if (user == null) {
            throw new UnauthorizedException("User is not authenticated.");
        }
        if (user.getRole() != Role.ROLE_STUDENT) {
            throw new ForbiddenException("Only students can perform payment actions.");
        }
    }

    @Transactional
    public void processPhonePeCallback(String xVerify, PhonePeCallbackRequest request) {
        if (request == null || request.response() == null) {
            throw new IllegalArgumentException("Callback request payload is missing");
        }

        // 1. Verify Checksum Signature
        String expectedChecksum = PhonePeChecksumUtil.generateCallbackChecksum(
                request.response(), phonePeConfig.getClientSecret(), phonePeConfig.getClientVersion()
        );
        if (xVerify == null || !xVerify.equalsIgnoreCase(expectedChecksum)) {
            throw new IllegalArgumentException("Invalid callback signature");
        }

        try {
            // 2. Decode and Parse Payload
            String decodedPayload = new String(Base64.getDecoder().decode(request.response()), StandardCharsets.UTF_8);
            JsonNode rootNode = objectMapper.readTree(decodedPayload);
            
            String merchantTransactionId = rootNode.path("data").path("merchantTransactionId").asText();
            String code = rootNode.path("code").asText();
            boolean success = rootNode.path("success").asBoolean();

            if (merchantTransactionId == null || merchantTransactionId.isBlank()) {
                throw new IllegalArgumentException("Transaction ID not found in callback payload");
            }

            // 3. Find and Update local Payment record
            Payment payment = paymentRepository.findByTransactionId(merchantTransactionId)
                    .orElseThrow(() -> new ResourceNotFoundException("Payment record not found for transaction: " + merchantTransactionId));

            // 4. Idempotency Check
            if (payment.getPaymentStatus() == PaymentStatus.SUCCESS) {
                return;
            }

            // 5. Update Status
            if ("PAYMENT_SUCCESS".equals(code) || success) {
                payment.setPaymentStatus(PaymentStatus.SUCCESS);

                // Update CBP registration state
                CbpRegistration registration = cbpRegistrationRepository.findById(payment.getRegistrationId())
                        .orElseThrow(() -> new ResourceNotFoundException("CBP registration not found for ID: " + payment.getRegistrationId()));
                registration.setRegistrationStatus(RegistrationStatus.REGISTERED);
                cbpRegistrationRepository.save(registration);
            } else {
                payment.setPaymentStatus(PaymentStatus.FAILED);
            }

            paymentRepository.save(payment);

        } catch (IllegalArgumentException | ResourceNotFoundException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalArgumentException("Error parsing callback payload: " + e.getMessage(), e);
        }
    }
}
