package com.cbp7.payment.service.impl;

import com.cbp7.auth.entity.User;
import com.cbp7.cbp.entity.CbpRegistration;
import com.cbp7.cbp.repository.CbpRegistrationRepository;
import com.cbp7.cbp.service.RegistrationFeeService;
import com.cbp7.common.exception.CbpRegistrationRequiredException;
import com.cbp7.common.exception.ResourceNotFoundException;
import com.cbp7.payment.dto.request.CreatePaymentRequest;
import com.cbp7.payment.dto.response.PaymentDetailResponse;
import com.cbp7.payment.dto.response.PaymentResponse;
import com.cbp7.payment.dto.response.PaymentStatusResponse;
import com.cbp7.payment.dto.response.PhonePePaymentResponse;
import com.cbp7.payment.dto.response.PhonePeStatusDetailsResponse;
import com.cbp7.payment.dto.response.PhonePeStatusResponse;
import com.cbp7.payment.entity.Payment;
import com.cbp7.payment.enums.PaymentMode;
import com.cbp7.payment.enums.PaymentStatus;
import com.cbp7.payment.gateway.PaymentGateway;
import com.cbp7.payment.mapper.PaymentMapper;
import com.cbp7.payment.repository.PaymentRepository;
import com.cbp7.payment.service.PaymentService;
import com.cbp7.payment.service.PaymentVerificationService;
import com.cbp7.payment.validation.PaymentValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final CbpRegistrationRepository cbpRegistrationRepository;
    private final PaymentGateway paymentGateway;
    private final PaymentVerificationService paymentVerificationService;
    private final RegistrationFeeService registrationFeeService;
    private final PaymentValidator paymentValidator;
    private final PaymentMapper paymentMapper;

    @Override
    @Transactional
    public PaymentResponse createPayment(User user, CreatePaymentRequest request) {
        
        paymentValidator.validateStudentRole(user);

        CbpRegistration registration = findCbpRegistration(user);

        boolean hasSuccessfulPayment = paymentRepository.existsByRegistrationIdAndPaymentStatus(
                registration.getId(), PaymentStatus.SUCCESS
        );
        paymentValidator.validateNoSuccessfulPayment(hasSuccessfulPayment);

        Payment payment = Payment.builder()
                .registrationId(registration.getId())
                .userId(user.getId())
                .paymentMode(request.paymentMode())
                .paymentStatus(PaymentStatus.PENDING)
                .amount(registrationFeeService.getRegistrationFee())
                .build();

        Payment savedPayment = paymentRepository.save(payment);
        return paymentMapper.toPaymentResponse(savedPayment);
    }

    @Override
    @Transactional
    public PhonePePaymentResponse initiatePhonePePayment(User user) {
        paymentValidator.validateStudentRole(user);

        CbpRegistration registration = findCbpRegistration(user);

        List<Payment> payments = paymentRepository.findByUserId(user.getId());
        boolean hasSuccessful = payments.stream().anyMatch(p -> p.getPaymentStatus() == PaymentStatus.SUCCESS);
        paymentValidator.validateNoSuccessfulPayment(hasSuccessful);

        Payment payment = findOrCreateInitiatedPayment(payments, registration, user);
        String redirectUrl = paymentGateway.initiatePayment(payment);

        return paymentMapper.toPhonePePaymentResponse(payment, redirectUrl);
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentDetailResponse getMyPayment(User user) {
        paymentValidator.validateStudentRole(user);

        List<Payment> payments = paymentRepository.findByUserId(user.getId());
        if (payments.isEmpty()) {
            throw new ResourceNotFoundException("No payment record found for current user.");
        }

        Payment payment = payments.stream()
                .filter(p -> p.getPaymentStatus() == PaymentStatus.SUCCESS)
                .findFirst()
                .orElseGet(() -> payments.stream()
                        .sorted((p1, p2) -> p2.getCreatedAt().compareTo(p1.getCreatedAt()))
                        .findFirst()
                        .orElseThrow(() -> new ResourceNotFoundException("No payment record found for current user.")));

        return paymentMapper.toPaymentDetailResponse(payment);
    }

    @Override
    @Transactional
    public PaymentStatusResponse verifyAndGetPaymentStatus(User user, String transactionId) {
        paymentValidator.validateStudentRole(user);

        Payment payment = findPaymentByTransactionId(transactionId);
        paymentValidator.validatePaymentOwnership(payment, user);

        Payment verifiedPayment = paymentVerificationService.verifyPaymentStatus(transactionId);
        return paymentMapper.toPaymentStatusResponse(verifiedPayment);
    }

    @Override
    @Transactional
    public PhonePeStatusDetailsResponse verifyAndGetStatusDetails(User user, String transactionId) {
        paymentValidator.validateStudentRole(user);

        Payment payment = findPaymentByTransactionId(transactionId);
        paymentValidator.validatePaymentOwnership(payment, user);

        Payment verifiedPayment = paymentVerificationService.verifyPaymentStatus(transactionId);
        String phonepeStatus = queryGatewayStatus(transactionId, verifiedPayment);

        return paymentMapper.toPhonePeStatusDetailsResponse(verifiedPayment, phonepeStatus);
    }

    // --- Private Helper Methods ---

    private CbpRegistration findCbpRegistration(User user) {
        return cbpRegistrationRepository.findByUserStudentIdIgnoreCase(user.getStudentId())
                .orElseThrow(() -> new CbpRegistrationRequiredException("Please complete CBP registration first."));
    }

    private Payment findPaymentByTransactionId(String transactionId) {
        return paymentRepository.findByTransactionId(transactionId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found for transaction: " + transactionId));
    }

    private Payment findOrCreateInitiatedPayment(List<Payment> payments, CbpRegistration registration, User user) {
        Payment payment = payments.stream()
                .filter(p -> p.getPaymentStatus() == PaymentStatus.PENDING 
                        || p.getPaymentStatus() == PaymentStatus.INITIATED 
                        || p.getPaymentStatus() == PaymentStatus.PROCESSING 
                        || p.getPaymentStatus() == PaymentStatus.FAILED)
                .findFirst()
                .orElseGet(() -> {
                    Payment newPayment = Payment.builder()
                            .registrationId(registration.getId())
                            .userId(user.getId())
                            .paymentMode(PaymentMode.ONLINE)
                            .paymentStatus(PaymentStatus.INITIATED)
                            .amount(registrationFeeService.getRegistrationFee())
                            .build();
                    return paymentRepository.save(newPayment);
                });

        String newTxnId = "CBP_TXN_" + UUID.randomUUID().toString().replace("-", "");
        payment.setTransactionId(newTxnId);
        payment.setPaymentMode(PaymentMode.ONLINE);
        payment.setPaymentStatus(PaymentStatus.INITIATED);

        return paymentRepository.saveAndFlush(payment);
    }

    private String queryGatewayStatus(String transactionId, Payment verifiedPayment) {
        try {
            PhonePeStatusResponse gatewayStatus = paymentGateway.checkPaymentStatus(transactionId);
            return gatewayStatus.state();
        } catch (Exception e) {
            return verifiedPayment.getPaymentStatus().name();
        }
    }
}
