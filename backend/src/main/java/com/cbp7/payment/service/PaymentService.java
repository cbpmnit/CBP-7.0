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
import com.cbp7.payment.dto.PhonePeStatusDetailsResponse;
import com.cbp7.payment.dto.PhonePeStatusResponse;
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
    public PhonePeStatusDetailsResponse verifyAndGetStatusDetails(User user, String transactionId) {
        validateStudentRole(user);

        // Fetch payment to check ownership before verification
        Payment payment = paymentRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found for transaction: " + transactionId));

        if (!payment.getUserId().equals(user.getId())) {
            throw new ForbiddenException("You are not authorized to view this payment status.");
        }

        // Verify and update status via PaymentVerificationService
        Payment verifiedPayment = paymentVerificationService.verifyPaymentStatus(transactionId);

        // Get actual gateway status
        String phonepeStatus = "PENDING";
        try {
            PhonePeStatusResponse gatewayStatus = paymentGateway.checkPaymentStatus(transactionId);
            phonepeStatus = gatewayStatus.state();
        } catch (Exception e) {
            phonepeStatus = verifiedPayment.getPaymentStatus().name();
        }

        return new PhonePeStatusDetailsResponse(
                verifiedPayment.getId(),
                verifiedPayment.getTransactionId(),
                verifiedPayment.getPaymentStatus(),
                verifiedPayment.getAmount(),
                phonepeStatus
        );
    }
}
